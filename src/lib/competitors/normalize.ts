import Category from "@/lib/models/Category";
import type {
  ExtractedCompetitorTool,
  NormalizedCompetitorTool,
} from "./types";

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeName(name: string): string {
  return normalizeText(
    name
      .replace(/\breview(s)?\b/gi, "")
      .replace(/\bpricing\b/gi, "")
      .replace(/\bcompare(d)?\b/gi, "")
      .trim()
  );
}

function getOfficialHost(url: string | null): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.startsWith("www.") ? host.slice(4) : host;
  } catch {
    return null;
  }
}

function tokenOverlap(a: string, b: string): number {
  const tokensA = new Set(a.split(" ").filter(Boolean));
  const tokensB = new Set(b.split(" ").filter(Boolean));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let overlap = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) overlap += 1;
  }
  return overlap / Math.max(tokensA.size, tokensB.size);
}

async function mapCategory(categoryText: string | null): Promise<string | null> {
  if (!categoryText) return null;
  const normalizedIncoming = normalizeText(categoryText);
  const categories = await Category.find({}, { name: 1 }).lean();

  let bestCategory: string | null = null;
  let bestScore = 0;
  for (const category of categories) {
    const score = tokenOverlap(normalizedIncoming, normalizeText(category.name));
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category.name;
    }
  }

  return bestScore >= 0.4 ? bestCategory : null;
}

function computeConfidence(input: {
  hasOfficialHost: boolean;
  hasRating: boolean;
  hasReviewCount: boolean;
  hasCategory: boolean;
  hasPricingSignals: boolean;
  isLikelyWellKnown: boolean;
  nameLength: number;
}): number {
  let score = 0.25;
  if (input.hasOfficialHost) score += 0.3;
  if (input.hasCategory) score += 0.18;
  if (input.hasRating) score += 0.1;
  if (input.hasReviewCount) score += 0.08;
  if (input.hasPricingSignals) score += 0.05;
  if (input.isLikelyWellKnown) score += 0.04;
  if (input.nameLength >= 3) score += 0.03;
  return Math.min(1, Number(score.toFixed(3)));
}

export async function normalizeExtractedTool(
  tool: ExtractedCompetitorTool
): Promise<NormalizedCompetitorTool> {
  const normalizedName = normalizeName(tool.name);
  const normalizedOfficialHost = getOfficialHost(tool.officialUrl);
  const mappedCategory = await mapCategory(tool.categoryText);
  const isLikelyWellKnown =
    tool.reviewCount !== null && tool.reviewCount >= 100;
  const confidence = computeConfidence({
    hasOfficialHost: Boolean(normalizedOfficialHost),
    hasRating: tool.rating !== null,
    hasReviewCount: tool.reviewCount !== null,
    hasCategory: Boolean(mappedCategory),
    hasPricingSignals: tool.pricingSignals.length > 0,
    isLikelyWellKnown,
    nameLength: normalizedName.length,
  });

  return {
    ...tool,
    normalizedName,
    normalizedOfficialHost,
    mappedCategory,
    confidence,
  };
}
