import { discoverSourceUrls } from "./discovery";
import { extractToolFromUrl } from "./extract";
import { normalizeExtractedTool } from "./normalize";
import { stageNormalizedTool, upsertToolFromIngestion } from "./upsert";
import { COMPETITOR_SOURCES, type CompetitorSource } from "./types";
import { collectSaasworthyToolsViaBrowser } from "./saasworthy-browser";
import { enrichExtractedTools } from "./enrich";

export interface RunCompetitorPipelineOptions {
  sources?: CompetitorSource[];
  dryRun?: boolean;
  maxPagesPerSource?: number;
  useBrowserCollector?: boolean;
  maxEnrichmentCalls?: number;
  maxToolsPerSource?: number;
}

export interface RunCompetitorPipelineResult {
  startedAt: string;
  finishedAt: string;
  dryRun: boolean;
  sources: CompetitorSource[];
  stats: {
    discovered: number;
    extracted: number;
    staged: number;
    queuedForReview: number;
    upserted: number;
    errors: number;
  };
}

export async function runCompetitorPipeline(
  options: RunCompetitorPipelineOptions = {}
): Promise<RunCompetitorPipelineResult> {
  const startedAt = new Date().toISOString();
  const dryRun = options.dryRun ?? true;
  const useBrowserCollector = options.useBrowserCollector ?? true;
  const maxEnrichmentCalls = Math.max(0, options.maxEnrichmentCalls ?? 50);
  const maxToolsPerSource = Math.max(1, options.maxToolsPerSource ?? 1000);
  const sources = options.sources?.length ? options.sources : [...COMPETITOR_SOURCES];
  const stats = {
    discovered: 0,
    extracted: 0,
    staged: 0,
    queuedForReview: 0,
    upserted: 0,
    errors: 0,
  };

  for (const source of sources) {
    if (source === "saasworthy" && useBrowserCollector) {
      try {
        const browserTools = await collectSaasworthyToolsViaBrowser({
          maxListPages: Math.min(options.maxPagesPerSource ?? 8, 40),
          maxProducts: maxToolsPerSource,
        });
        const uniqueBrowserTools = new Map<string, (typeof browserTools)[number]>();
        for (const item of browserTools) {
          uniqueBrowserTools.set(`${item.source}:${item.sourceToolId}`, item);
        }
        const enrichedBrowserTools = await enrichExtractedTools(
          [...uniqueBrowserTools.values()].slice(0, maxToolsPerSource),
          { maxEnrichmentCalls: Math.min(maxEnrichmentCalls, 40) }
        );
        stats.discovered += enrichedBrowserTools.length;

        for (const extracted of enrichedBrowserTools) {
          const normalized = await normalizeExtractedTool(extracted);
          const staged = await stageNormalizedTool(normalized);
          stats.extracted += 1;
          stats.staged += 1;

          if (staged.status === "needs_review") {
            stats.queuedForReview += 1;
            continue;
          }

          if (!dryRun) {
            const upsertResult = await upsertToolFromIngestion(staged.ingestionId);
            if (!upsertResult.skipped) stats.upserted += 1;
          }
        }
        continue;
      } catch (error) {
        stats.errors += 1;
        console.error("[CompetitorPipeline] saasworthy browser collector failed", error);
      }
    }

    const discovered = await discoverSourceUrls(source, {
      maxPages: options.maxPagesPerSource,
    });
    const extractedBatch: NonNullable<Awaited<ReturnType<typeof extractToolFromUrl>>>[] = [];

    for (const url of discovered) {
      if (extractedBatch.length >= maxToolsPerSource) break;
      try {
        const extracted = await extractToolFromUrl(url);
        if (!extracted) continue;
        extractedBatch.push(extracted);
      } catch (error) {
        stats.errors += 1;
        console.error(`[CompetitorPipeline] ${source} failed for ${url.url}`, error);
      }
    }

    const uniqueBySourceToolId = new Map<string, (typeof extractedBatch)[number]>();
    for (const item of extractedBatch) {
      uniqueBySourceToolId.set(`${item.source}:${item.sourceToolId}`, item);
    }

    const enrichedBatch = await enrichExtractedTools(
      [...uniqueBySourceToolId.values()].slice(0, maxToolsPerSource),
      { maxEnrichmentCalls }
    );
    stats.discovered += discovered.length;
    stats.extracted += enrichedBatch.length;

    for (const extracted of enrichedBatch) {
      const normalized = await normalizeExtractedTool(extracted);
      const staged = await stageNormalizedTool(normalized);
      stats.staged += 1;

      if (staged.status === "needs_review") {
        stats.queuedForReview += 1;
        continue;
      }

      if (!dryRun) {
        const upsertResult = await upsertToolFromIngestion(staged.ingestionId);
        if (!upsertResult.skipped) stats.upserted += 1;
      }
    }
  }

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    dryRun,
    sources,
    stats,
  };
}
