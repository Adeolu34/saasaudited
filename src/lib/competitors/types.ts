export const COMPETITOR_SOURCES = [
  "saasworthy",
  "g2",
  "capterra",
  "getapp",
  "trustradius",
  "alternativeto",
] as const;

export type CompetitorSource = (typeof COMPETITOR_SOURCES)[number];

export type CompetitorPageType =
  | "list"
  | "product"
  | "review"
  | "comparison"
  | "other";

export interface SourceConfig {
  source: CompetitorSource;
  baseUrl: string;
  seedUrls: string[];
  allowPathPrefixes: string[];
  disallowPathPrefixes: string[];
  userAgent: string;
  crawlDelayMs: number;
  maxPagesPerRun: number;
}

export interface RobotsRuleSet {
  allow: string[];
  disallow: string[];
}

export interface RobotsEvaluation {
  allowed: boolean;
  matchedRule: string | null;
}

export interface DiscoveredUrl {
  source: CompetitorSource;
  url: string;
  pageType: CompetitorPageType;
  discoveredFrom: string;
}

export interface ExtractedCompetitorTool {
  source: CompetitorSource;
  sourceUrl: string;
  sourceToolId: string;
  name: string;
  slugCandidate: string;
  officialUrl: string | null;
  categoryText: string | null;
  rating: number | null;
  reviewCount: number | null;
  pricingSignals: string[];
  pageType: CompetitorPageType;
}

export interface NormalizedCompetitorTool extends ExtractedCompetitorTool {
  normalizedName: string;
  normalizedOfficialHost: string | null;
  mappedCategory: string | null;
  confidence: number;
}
