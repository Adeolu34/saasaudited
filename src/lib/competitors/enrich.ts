import { searchSaaS } from "@/lib/ai/search";
import { getSourceConfig } from "./config";
import type { CompetitorSource, ExtractedCompetitorTool } from "./types";

const COMMON_NON_OFFICIAL_DOMAINS = new Set([
  "wikipedia.org",
  "youtube.com",
  "linkedin.com",
  "x.com",
  "twitter.com",
  "facebook.com",
  "reddit.com",
  "github.com",
  "g2.com",
  "capterra.com",
  "getapp.com",
  "trustradius.com",
  "alternativeto.net",
  "saasworthy.com",
]);

function hostFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

function inferOfficialUrl(
  source: CompetitorSource,
  links: string[]
): string | null {
  const sourceHost = hostFromUrl(getSourceConfig(source).baseUrl);
  for (const link of links) {
    const host = hostFromUrl(link);
    if (!host) continue;
    if (sourceHost && host === sourceHost) continue;
    if ([...COMMON_NON_OFFICIAL_DOMAINS].some((blocked) => host.endsWith(blocked))) continue;
    return link;
  }
  return null;
}

function inferCategoryFromText(snippets: string[]): string | null {
  const text = snippets.join(" ").toLowerCase();
  const map: Record<string, string> = {
    "crm": "CRM Software",
    "customer relationship": "CRM Software",
    "project management": "Project Management",
    "task management": "Project Management",
    "help desk": "Customer Service",
    "customer support": "Customer Service",
    "analytics": "Analytics",
    "business intelligence": "Data Analytics",
    "hr": "HR Software",
    "human resources": "HR Software",
    "marketing automation": "Marketing Automation",
    "email marketing": "Marketing Automation",
    "design": "Design Systems",
    "prototyping": "Design Systems",
    "developer tools": "DevTools",
    "hosting": "DevTools",
    "communication": "Communication",
    "chat": "Communication",
    "ai": "AI Platforms",
  };

  let bestCategory: string | null = null;
  let bestScore = 0;
  for (const [keyword, category] of Object.entries(map)) {
    const score = text.includes(keyword) ? keyword.length : 0;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  return bestCategory;
}

function inferRating(snippets: string[]): number | null {
  for (const snippet of snippets) {
    const match = snippet.match(/([0-5](?:\.[0-9]+)?)\s*\/\s*5/i);
    if (!match?.[1]) continue;
    const value = Number.parseFloat(match[1]);
    if (Number.isFinite(value) && value >= 0 && value <= 5) return value;
  }
  return null;
}

function inferReviewCount(snippets: string[]): number | null {
  for (const snippet of snippets) {
    const match = snippet.match(/([\d,]+)\s+reviews?/i);
    if (!match?.[1]) continue;
    const value = Number.parseInt(match[1].replace(/,/g, ""), 10);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return null;
}

export async function enrichExtractedTools(
  tools: ExtractedCompetitorTool[],
  options?: { maxEnrichmentCalls?: number }
): Promise<ExtractedCompetitorTool[]> {
  const maxCalls = Math.max(0, options?.maxEnrichmentCalls ?? 40);
  if (maxCalls === 0) return tools;

  const enriched: ExtractedCompetitorTool[] = [];
  let usedCalls = 0;

  for (const tool of tools) {
    const needsEnrichment =
      !tool.officialUrl || !tool.categoryText || tool.rating === null || tool.reviewCount === null;

    if (!needsEnrichment || usedCalls >= maxCalls) {
      enriched.push(tool);
      continue;
    }

    const query = `"${tool.name}" official website software`;
    const search = await searchSaaS(query);
    usedCalls += 1;

    const links = search.results.map((r) => r.link);
    const snippets = search.results.map((r) => `${r.title} ${r.snippet}`);

    enriched.push({
      ...tool,
      officialUrl: tool.officialUrl ?? inferOfficialUrl(tool.source, links),
      categoryText: tool.categoryText ?? inferCategoryFromText(snippets),
      rating: tool.rating ?? inferRating(snippets),
      reviewCount: tool.reviewCount ?? inferReviewCount(snippets),
    });
  }

  return enriched;
}
