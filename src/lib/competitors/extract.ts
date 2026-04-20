import type {
  CompetitorPageType,
  CompetitorSource,
  DiscoveredUrl,
  ExtractedCompetitorTool,
} from "./types";
import { getSourceConfig } from "./config";

type JsonLdObject = Record<string, unknown>;

function extractTitle(html: string): string | null {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (og?.[1]) return og[1].trim();
  const title = html.match(/<title[^>]*>(.*?)<\/title>/i);
  return title?.[1]?.trim() ?? null;
}

function extractJsonLdBlocks(html: string): JsonLdObject[] {
  const matches = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  const blocks: JsonLdObject[] = [];
  for (const match of matches) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && typeof item === "object") blocks.push(item as JsonLdObject);
        }
      } else if (parsed && typeof parsed === "object") {
        blocks.push(parsed as JsonLdObject);
      }
    } catch {
      // ignore malformed json-ld
    }
  }
  return blocks;
}

function pickJsonLd(blocks: JsonLdObject[], typeName: string): JsonLdObject | null {
  for (const block of blocks) {
    const blockType = block["@type"];
    if (typeof blockType === "string" && blockType.toLowerCase() === typeName.toLowerCase()) {
      return block;
    }
    if (Array.isArray(blockType)) {
      const matched = blockType.some(
        (value) => typeof value === "string" && value.toLowerCase() === typeName.toLowerCase()
      );
      if (matched) return block;
    }
  }
  return null;
}

function cleanToolName(title: string, source: CompetitorSource): string {
  const sourceNames: Record<CompetitorSource, string[]> = {
    saasworthy: ["SaaSworthy", "| SaaSworthy"],
    g2: ["G2", "| G2"],
    capterra: ["Capterra", "| Capterra"],
    getapp: ["GetApp", "| GetApp"],
    trustradius: ["TrustRadius", "| TrustRadius"],
    alternativeto: ["AlternativeTo", "| AlternativeTo"],
  };
  let name = title;
  for (const snippet of sourceNames[source]) {
    name = name.replaceAll(snippet, "");
  }
  name = name.split("|")[0]?.split(" - ")[0]?.trim() ?? name.trim();
  return name.replace(/\s+/g, " ").trim();
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function extractOfficialUrl(html: string): string | null {
  const relMatches = html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi);
  for (const match of relMatches) {
    const href = match[1]?.trim();
    const text = (match[2] ?? "").toLowerCase();
    if (!href || !/^https?:\/\//i.test(href)) continue;
    if (text.includes("visit website") || text.includes("official website") || text.includes("website")) {
      return href;
    }
  }
  return null;
}

function extractRating(html: string): number | null {
  const patterns = [
    /([0-5](?:\.\d+)?)\s*\/\s*5(?:\.0)?/i,
    /rating[^0-9]{0,20}([0-5](?:\.\d+)?)/i,
    /([0-9](?:\.[0-9])?)\s*stars?/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match?.[1]) continue;
    const value = Number.parseFloat(match[1]);
    if (Number.isFinite(value) && value >= 0 && value <= 5) return value;
  }
  return null;
}

function extractReviewCount(html: string): number | null {
  const patterns = [
    /([\d,]+)\s+reviews?/i,
    /reviews?[^0-9]{0,15}([\d,]+)/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match?.[1]) continue;
    const value = Number.parseInt(match[1].replace(/,/g, ""), 10);
    if (Number.isFinite(value) && value >= 0) return value;
  }
  return null;
}

function extractCategory(html: string): string | null {
  const breadcrumb = html.match(
    /<meta[^>]+property=["']article:section["'][^>]+content=["']([^"']+)["']/i
  );
  if (breadcrumb?.[1]) return breadcrumb[1].trim();

  const categoryText = html.match(/(?:category|categories)[^<]{0,50}<[^>]*>([^<]+)</i);
  if (categoryText?.[1]) return categoryText[1].trim();

  return null;
}

function extractPricingSignals(html: string): string[] {
  const signals = new Set<string>();
  if (/free trial/i.test(html)) signals.add("free_trial");
  if (/free plan/i.test(html)) signals.add("free_plan");
  if (/\$[0-9]+(?:\.[0-9]{2})?/i.test(html)) signals.add("paid_pricing");
  if (/contact sales|custom pricing/i.test(html)) signals.add("contact_sales");
  return [...signals];
}

async function fetchHtml(source: CompetitorSource, url: string): Promise<string | null> {
  const config = getSourceConfig(source);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const response = await fetch(url, {
      headers: { "User-Agent": config.userAgent },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    // Some competitor pages return anti-bot challenge HTML with 403/429.
    // We still read body content so challenge detection/fallback can run.
    if (!response.ok && response.status !== 403 && response.status !== 429) return null;
    return await response.text();
  } catch {
    return null;
  }
}

function isBotChallengePage(html: string): boolean {
  const lower = html.toLowerCase();
  return (
    lower.includes("just a moment") ||
    lower.includes("cf-challenge") ||
    lower.includes("cloudflare") ||
    lower.includes("captcha")
  );
}

function deriveNameFromUrl(url: string): string {
  const slug = sourceToolIdFromUrl(url)
    .replace(/[-_]+/g, " ")
    .trim();
  if (!slug) return "";
  return slug
    .split(" ")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ")
    .trim();
}

function sourceToolIdFromUrl(url: string): string {
  const pathParts = new URL(url).pathname.split("/").filter(Boolean);
  return pathParts[pathParts.length - 1] ?? "unknown";
}

export async function extractToolFromUrl(discovered: DiscoveredUrl): Promise<ExtractedCompetitorTool | null> {
  const urlPath = new URL(discovered.url).pathname.toLowerCase();
  const shouldAttemptExtraction =
    discovered.pageType === "product" ||
    discovered.pageType === "review" ||
    urlPath.includes("/product/") ||
    urlPath.includes("/software/");
  if (!shouldAttemptExtraction) return null;

  const html = await fetchHtml(discovered.source, discovered.url);
  if (!html) return null;

  if (isBotChallengePage(html)) {
    const nameFromUrl = deriveNameFromUrl(discovered.url);
    if (!nameFromUrl) return null;
    return {
      source: discovered.source,
      sourceUrl: discovered.url,
      sourceToolId: sourceToolIdFromUrl(discovered.url),
      name: nameFromUrl,
      slugCandidate: slugify(nameFromUrl),
      officialUrl: null,
      categoryText: null,
      rating: null,
      reviewCount: null,
      pricingSignals: [],
      pageType: discovered.pageType as CompetitorPageType,
    };
  }

  const jsonLdBlocks = extractJsonLdBlocks(html);
  const softwareLd =
    pickJsonLd(jsonLdBlocks, "SoftwareApplication") ??
    pickJsonLd(jsonLdBlocks, "Product") ??
    pickJsonLd(jsonLdBlocks, "WebApplication");
  const aggregateLd = pickJsonLd(jsonLdBlocks, "AggregateRating");

  const ldName = typeof softwareLd?.name === "string" ? softwareLd.name : null;
  const title = extractTitle(html);
  const fallbackName = title ? cleanToolName(title, discovered.source) : null;
  const name = (ldName ?? fallbackName ?? "").trim();
  if (!name || name.length < 2) return null;

  const ldOfficialUrl =
    typeof softwareLd?.url === "string"
      ? softwareLd.url
      : typeof softwareLd?.sameAs === "string"
        ? softwareLd.sameAs
        : null;

  const ldCategory =
    typeof softwareLd?.applicationCategory === "string"
      ? softwareLd.applicationCategory
      : typeof softwareLd?.category === "string"
        ? softwareLd.category
        : null;

  const ldRatingRaw =
    typeof aggregateLd?.ratingValue === "string" || typeof aggregateLd?.ratingValue === "number"
      ? Number(aggregateLd.ratingValue)
      : typeof softwareLd?.aggregateRating === "object" &&
          softwareLd.aggregateRating &&
          ("ratingValue" in (softwareLd.aggregateRating as object))
        ? Number((softwareLd.aggregateRating as Record<string, unknown>).ratingValue)
        : null;
  const ldRating =
    ldRatingRaw !== null && Number.isFinite(ldRatingRaw) && ldRatingRaw >= 0 && ldRatingRaw <= 5
      ? ldRatingRaw
      : null;

  const ldReviewCountRaw =
    typeof aggregateLd?.reviewCount === "string" || typeof aggregateLd?.reviewCount === "number"
      ? Number(aggregateLd.reviewCount)
      : typeof softwareLd?.aggregateRating === "object" &&
          softwareLd.aggregateRating &&
          ("reviewCount" in (softwareLd.aggregateRating as object))
        ? Number((softwareLd.aggregateRating as Record<string, unknown>).reviewCount)
        : null;
  const ldReviewCount =
    ldReviewCountRaw !== null && Number.isFinite(ldReviewCountRaw) && ldReviewCountRaw >= 0
      ? ldReviewCountRaw
      : null;

  return {
    source: discovered.source,
    sourceUrl: discovered.url,
    sourceToolId: sourceToolIdFromUrl(discovered.url),
    name,
    slugCandidate: slugify(name),
    officialUrl: ldOfficialUrl ?? extractOfficialUrl(html),
    categoryText: ldCategory ?? extractCategory(html),
    rating: ldRating ?? extractRating(html),
    reviewCount: ldReviewCount ?? extractReviewCount(html),
    pricingSignals: extractPricingSignals(html),
    pageType: discovered.pageType as CompetitorPageType,
  };
}
