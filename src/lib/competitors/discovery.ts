import { getSourceConfig } from "./config";
import { evaluateRobotsAccess, fetchRobotsRules } from "./robots";
import type { CompetitorPageType, CompetitorSource, DiscoveredUrl } from "./types";
import { searchSaaS } from "@/lib/ai/search";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hash = "";
  if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }
  return parsed.toString();
}

function extractLinksFromHtml(html: string, baseUrl: string): string[] {
  const hrefMatches = html.matchAll(/href=["']([^"'#]+)["']/gi);
  const links = new Set<string>();
  for (const match of hrefMatches) {
    const href = match[1]?.trim();
    if (!href) continue;
    if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
      continue;
    }
    try {
      const absolute = new URL(href, baseUrl).toString();
      links.add(normalizeUrl(absolute));
    } catch {
      // ignore invalid URLs
    }
  }
  return [...links];
}

function extractLocEntries(xml: string): string[] {
  const matches = xml.matchAll(/<loc>(.*?)<\/loc>/gi);
  const urls = new Set<string>();
  for (const match of matches) {
    const value = match[1]?.trim();
    if (value) urls.add(value);
  }
  return [...urls];
}

function extractSitemapIndexEntries(xml: string): string[] {
  const matches = xml.matchAll(/<sitemap>\s*<loc>(.*?)<\/loc>\s*<\/sitemap>/gi);
  const urls = new Set<string>();
  for (const match of matches) {
    const value = match[1]?.trim();
    if (value) urls.add(value);
  }
  return [...urls];
}

function classifyPageType(pathname: string): CompetitorPageType {
  const lower = pathname.toLowerCase();
  if (lower.includes("/compare") || lower.includes("/vs-")) return "comparison";
  if (lower.includes("/review")) return "review";
  if (
    lower.includes("/product/") ||
    lower.includes("/products/") ||
    lower.includes("/software/") ||
    lower.includes("/apps/") ||
    lower.includes("/app/")
  ) {
    return "product";
  }
  if (lower.includes("/list") || lower.includes("/category") || lower.includes("/categories")) {
    return "list";
  }
  return "other";
}

async function fetchText(url: string, userAgent: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const response = await fetch(url, {
      headers: { "User-Agent": userAgent },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

async function collectUrlsFromSitemaps(
  sitemapUrls: string[],
  userAgent: string,
  maxSitemapFiles = 30
): Promise<string[]> {
  const pending = [...sitemapUrls];
  const visited = new Set<string>();
  const urlSet = new Set<string>();

  while (pending.length > 0 && visited.size < maxSitemapFiles) {
    const current = pending.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const xml = await fetchText(current, userAgent);
    if (!xml) continue;

    for (const nested of extractSitemapIndexEntries(xml)) {
      if (!visited.has(nested)) pending.push(nested);
    }

    for (const loc of extractLocEntries(xml)) {
      if (!loc.endsWith(".xml")) urlSet.add(normalizeUrl(loc));
    }
  }

  return [...urlSet];
}

async function discoverViaSearchEngine(source: CompetitorSource): Promise<string[]> {
  const config = getSourceConfig(source);
  const host = new URL(config.baseUrl).hostname;
  const queries: Record<CompetitorSource, string[]> = {
    saasworthy: [
      `site:${host}/product/`,
      `site:${host} "Features, Reviews & Pricing"`,
      `site:${host} "Most Worthy"`,
    ],
    g2: [`site:${host}/products/`, `site:${host} "Reviews"`],
    capterra: [`site:${host}/software/`, `site:${host} "reviews"`],
    getapp: [`site:${host}/software/`, `site:${host} "pricing"`],
    trustradius: [`site:${host}/products/`, `site:${host} "reviews"`],
    alternativeto: [`site:${host}/software/`, `site:${host} "alternatives"`],
  };

  const links = new Set<string>();
  for (const query of queries[source]) {
    const result = await searchSaaS(query);
    for (const row of result.results) {
      try {
        const normalized = normalizeUrl(row.link);
        if (new URL(normalized).hostname === host) links.add(normalized);
      } catch {
        // ignore
      }
    }
  }
  return [...links];
}

export async function discoverSourceUrls(
  source: CompetitorSource,
  options?: { maxPages?: number }
): Promise<DiscoveredUrl[]> {
  const config = getSourceConfig(source);
  const rules = await fetchRobotsRules(source);
  const maxPages = Math.min(
    options?.maxPages ?? config.maxPagesPerRun,
    config.maxPagesPerRun
  );

  const discovered = new Map<string, DiscoveredUrl>();
  const queue: string[] = [...config.seedUrls];
  const visited = new Set<string>();

  // Include sitemap seeds where accessible.
  const robotsXml = await fetchText(new URL("/robots.txt", config.baseUrl).toString(), config.userAgent);
  const sitemapLinks = robotsXml
    ? robotsXml
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.toLowerCase().startsWith("sitemap:"))
        .map((line) => line.split(":").slice(1).join(":").trim())
    : [];
  const discoveredFromSitemaps = await collectUrlsFromSitemaps(
    sitemapLinks.slice(0, 6),
    config.userAgent
  );
  for (const loc of discoveredFromSitemaps.slice(0, 1500)) queue.push(loc);

  // Fallback for sites with anti-bot HTML where link extraction is sparse.
  const searchDiscovered = await discoverViaSearchEngine(source);
  for (const loc of searchDiscovered.slice(0, 300)) queue.push(loc);

  while (queue.length > 0 && visited.size < maxPages) {
    const current = normalizeUrl(queue.shift()!);
    if (visited.has(current)) continue;
    visited.add(current);

    const robotsDecision = evaluateRobotsAccess(source, current, rules);
    if (!robotsDecision.allowed) continue;

    const parsed = new URL(current);
    discovered.set(current, {
      source,
      url: current,
      pageType: classifyPageType(parsed.pathname),
      discoveredFrom: "crawl",
    });

    const html = await fetchText(current, config.userAgent);
    if (!html) continue;

    const links = extractLinksFromHtml(html, current);
    for (const link of links) {
      if (visited.has(link)) continue;
      const decision = evaluateRobotsAccess(source, link, rules);
      if (!decision.allowed) continue;
      queue.push(link);
    }

    await sleep(config.crawlDelayMs);
  }

  return [...discovered.values()];
}
