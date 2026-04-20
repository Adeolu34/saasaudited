import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/auth/cron-auth";
import dbConnect from "@/lib/mongodb";
import { runCompetitorPipeline } from "@/lib/competitors/pipeline";
import { COMPETITOR_SOURCES, type CompetitorSource } from "@/lib/competitors/types";

export const maxDuration = 300;

function parseSources(value: string | null): CompetitorSource[] {
  if (!value) return [...COMPETITOR_SOURCES];
  const requested = value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean) as CompetitorSource[];
  const allowed = new Set(COMPETITOR_SOURCES);
  return requested.filter((v) => allowed.has(v));
}

function parseBoolean(value: string | null, fallback: boolean): boolean {
  if (value === null) return fallback;
  return value.toLowerCase() === "true";
}

async function runInBackground(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sources = parseSources(searchParams.get("sources"));
  const dryRun = parseBoolean(searchParams.get("dryRun"), true);
  const maxPagesRaw = Number.parseInt(searchParams.get("maxPagesPerSource") ?? "", 10);
  const maxPagesPerSource = Number.isFinite(maxPagesRaw) ? maxPagesRaw : undefined;
  const maxToolsRaw = Number.parseInt(searchParams.get("maxToolsPerSource") ?? "", 10);
  const maxToolsPerSource = Number.isFinite(maxToolsRaw)
    ? Math.max(1, maxToolsRaw)
    : 1000;
  const maxEnrichmentRaw = Number.parseInt(searchParams.get("maxEnrichmentCalls") ?? "", 10);
  const maxEnrichmentCalls = Number.isFinite(maxEnrichmentRaw)
    ? Math.max(0, maxEnrichmentRaw)
    : 400;
  const useBrowserCollector = parseBoolean(searchParams.get("useBrowserCollector"), true);

  await dbConnect();
  const result = await runCompetitorPipeline({
    sources,
    dryRun,
    maxPagesPerSource,
    maxToolsPerSource,
    maxEnrichmentCalls,
    useBrowserCollector,
  });
  console.log("[CompetitorPipeline] completed", JSON.stringify(result));
}

/**
 * POST /api/cron/competitor-intel
 *
 * Query params:
 * - sources=saasworthy,g2,capterra,getapp,trustradius,alternativeto
 * - dryRun=true|false (default true)
 * - maxPagesPerSource=100
 */
export async function POST(request: NextRequest) {
  const authError = verifyCronAuth(request.headers.get("authorization"));
  if (authError) return authError;

  runInBackground(request).catch((err) =>
    console.error("[CompetitorPipeline] failed:", err)
  );

  return NextResponse.json({
    success: true,
    message: "Competitor intelligence pipeline started in background",
  });
}
