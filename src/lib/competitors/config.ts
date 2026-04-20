import { SourceConfig, COMPETITOR_SOURCES, type CompetitorSource } from "./types";

const DEFAULT_USER_AGENT = "SaasAuditedIntelBot/1.0 (+https://saasaudited.com)";

const SOURCE_CONFIG: Record<CompetitorSource, SourceConfig> = {
  saasworthy: {
    source: "saasworthy",
    baseUrl: "https://www.saasworthy.com",
    seedUrls: [
      "https://www.saasworthy.com/list",
      "https://www.saasworthy.com/list/new-saas-products",
      "https://www.saasworthy.com/list/new-saas-products?page=1",
      "https://www.saasworthy.com/list/new-saas-products?page=2",
      "https://www.saasworthy.com/list/new-saas-products?page=3",
      "https://www.saasworthy.com/list/new-saas-products?page=4",
      "https://www.saasworthy.com/list/new-saas-products?page=5",
    ],
    allowPathPrefixes: ["/list", "/product", "/compare"],
    disallowPathPrefixes: ["/comments", "/redir.php", "/login", "/signup", "/account"],
    userAgent: DEFAULT_USER_AGENT,
    crawlDelayMs: 600,
    maxPagesPerRun: 3000,
  },
  g2: {
    source: "g2",
    baseUrl: "https://www.g2.com",
    seedUrls: ["https://www.g2.com/categories", "https://www.g2.com/products"],
    allowPathPrefixes: ["/categories", "/products"],
    disallowPathPrefixes: ["/login", "/signup", "/account", "/dashboard"],
    userAgent: DEFAULT_USER_AGENT,
    crawlDelayMs: 800,
    maxPagesPerRun: 3000,
  },
  capterra: {
    source: "capterra",
    baseUrl: "https://www.capterra.com",
    seedUrls: [
      "https://www.capterra.com/categories/",
      "https://www.capterra.com/software/",
    ],
    allowPathPrefixes: ["/categories", "/software", "/p"],
    disallowPathPrefixes: ["/login", "/signup", "/vendors", "/privacy"],
    userAgent: DEFAULT_USER_AGENT,
    crawlDelayMs: 800,
    maxPagesPerRun: 3000,
  },
  getapp: {
    source: "getapp",
    baseUrl: "https://www.getapp.com",
    seedUrls: ["https://www.getapp.com/categories/", "https://www.getapp.com/software/"],
    allowPathPrefixes: ["/categories", "/software"],
    disallowPathPrefixes: ["/login", "/signup", "/vendors", "/about"],
    userAgent: DEFAULT_USER_AGENT,
    crawlDelayMs: 800,
    maxPagesPerRun: 3000,
  },
  trustradius: {
    source: "trustradius",
    baseUrl: "https://www.trustradius.com",
    seedUrls: ["https://www.trustradius.com/categories", "https://www.trustradius.com/products"],
    allowPathPrefixes: ["/categories", "/products", "/compare"],
    disallowPathPrefixes: ["/login", "/signup", "/account", "/vendor"],
    userAgent: DEFAULT_USER_AGENT,
    crawlDelayMs: 800,
    maxPagesPerRun: 3000,
  },
  alternativeto: {
    source: "alternativeto",
    baseUrl: "https://alternativeto.net",
    seedUrls: ["https://alternativeto.net/browse/software/", "https://alternativeto.net/software/"],
    allowPathPrefixes: ["/browse", "/software"],
    disallowPathPrefixes: ["/account", "/users", "/settings", "/advertise"],
    userAgent: DEFAULT_USER_AGENT,
    crawlDelayMs: 700,
    maxPagesPerRun: 3000,
  },
};

export function getSourceConfig(source: CompetitorSource): SourceConfig {
  return SOURCE_CONFIG[source];
}

export function getAllSourceConfigs(): SourceConfig[] {
  return COMPETITOR_SOURCES.map((source) => SOURCE_CONFIG[source]);
}
