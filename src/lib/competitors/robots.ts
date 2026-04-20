import { getSourceConfig } from "./config";
import type { CompetitorSource, RobotsEvaluation, RobotsRuleSet } from "./types";

const HARD_BLOCK_PATH_SNIPPETS = [
  "/login",
  "/signup",
  "/account",
  "/dashboard",
  "/admin",
  "/checkout",
] as const;

function normalizePath(path: string): string {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function longestPrefixMatch(path: string, rules: string[]): string | null {
  let bestMatch: string | null = null;
  for (const rawRule of rules) {
    const rule = normalizePath(rawRule.trim());
    if (rule === "/") {
      if (!bestMatch || bestMatch.length < 1) bestMatch = rule;
      continue;
    }
    if (path.startsWith(rule) && (!bestMatch || rule.length > bestMatch.length)) {
      bestMatch = rule;
    }
  }
  return bestMatch;
}

function parseRobotsTxt(robotsTxt: string): RobotsRuleSet {
  const lines = robotsTxt
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  const wildcardRules: RobotsRuleSet = { allow: [], disallow: [] };
  let activeWildcardGroup = false;

  for (const line of lines) {
    const [rawKey, ...rest] = line.split(":");
    if (!rawKey || rest.length === 0) continue;
    const key = rawKey.trim().toLowerCase();
    const value = rest.join(":").trim();

    if (key === "user-agent") {
      activeWildcardGroup = value === "*";
      continue;
    }

    if (!activeWildcardGroup) continue;

    if (key === "allow") wildcardRules.allow.push(normalizePath(value));
    if (key === "disallow" && value) wildcardRules.disallow.push(normalizePath(value));
  }

  return wildcardRules;
}

export async function fetchRobotsRules(source: CompetitorSource): Promise<RobotsRuleSet> {
  const config = getSourceConfig(source);
  const robotsUrl = new URL("/robots.txt", config.baseUrl).toString();

  try {
    const response = await fetch(robotsUrl, {
      headers: { "User-Agent": config.userAgent },
      cache: "no-store",
    });
    if (!response.ok) {
      return { allow: [], disallow: [] };
    }
    const robotsTxt = await response.text();
    return parseRobotsTxt(robotsTxt);
  } catch {
    return { allow: [], disallow: [] };
  }
}

export function evaluateRobotsAccess(
  source: CompetitorSource,
  targetUrl: string,
  rules: RobotsRuleSet
): RobotsEvaluation {
  const config = getSourceConfig(source);
  const url = new URL(targetUrl);
  const path = normalizePath(url.pathname);

  if (url.hostname !== new URL(config.baseUrl).hostname) {
    return { allowed: false, matchedRule: "cross-host" };
  }

  if (
    HARD_BLOCK_PATH_SNIPPETS.some((snippet) => path.includes(snippet)) ||
    config.disallowPathPrefixes.some((prefix) => path.startsWith(prefix))
  ) {
    return { allowed: false, matchedRule: "hard-block" };
  }

  if (
    config.allowPathPrefixes.length > 0 &&
    !config.allowPathPrefixes.some((prefix) => path.startsWith(prefix))
  ) {
    return { allowed: false, matchedRule: "outside-allowlist" };
  }

  const bestAllow = longestPrefixMatch(path, rules.allow);
  const bestDisallow = longestPrefixMatch(path, rules.disallow);
  if (bestDisallow && (!bestAllow || bestDisallow.length >= bestAllow.length)) {
    return { allowed: false, matchedRule: bestDisallow };
  }

  return { allowed: true, matchedRule: bestAllow };
}
