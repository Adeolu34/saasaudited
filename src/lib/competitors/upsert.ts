import Tool from "@/lib/models/Tool";
import CompetitorIngestion from "@/lib/models/CompetitorIngestion";
import type { CompetitorSource, NormalizedCompetitorTool } from "./types";

const UPSERT_CONFIDENCE_THRESHOLD = 0.85;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function ratingToOverallScore(rating: number | null): number {
  if (rating === null) return 7.5;
  return Math.max(1, Math.min(10, Number((rating * 2).toFixed(1))));
}

function resolveRatingLabel(score: number): string {
  if (score >= 9) return "Exceptional";
  if (score >= 8.5) return "Excellent";
  if (score >= 7.5) return "Very Good";
  if (score >= 6.5) return "Good";
  return "Fair";
}

function toolDescription(name: string, source: CompetitorSource): string {
  return `${name} discovered from ${source} competitor intelligence feed. Editorial review pending.`;
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug || "tool";
  let counter = 1;
  while (await Tool.findOne({ slug }).select("_id").lean()) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
  return slug;
}

async function matchExistingTool(candidate: NormalizedCompetitorTool) {
  if (candidate.normalizedOfficialHost) {
    const byOfficial = await Tool.findOne({
      official_url: { $regex: candidate.normalizedOfficialHost.replace(/\./g, "\\."), $options: "i" },
    })
      .select("slug")
      .lean();
    if (byOfficial) return byOfficial;
  }

  const bySlug = await Tool.findOne({ slug: candidate.slugCandidate }).select("slug").lean();
  if (bySlug) return bySlug;

  return Tool.findOne({ name: new RegExp(`^${candidate.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") })
    .select("slug")
    .lean();
}

export async function stageNormalizedTool(
  candidate: NormalizedCompetitorTool
): Promise<{
  status: "pending" | "needs_review" | "upserted";
  ingestionId: string;
  matchedToolSlug?: string;
}> {
  const existingTool = await matchExistingTool(candidate);
  const status = candidate.confidence >= UPSERT_CONFIDENCE_THRESHOLD ? "pending" : "needs_review";

  const update = {
    page_type: candidate.pageType,
    status,
    source_tool_id: candidate.sourceToolId,
    name: candidate.name,
    slug_candidate: candidate.slugCandidate,
    official_url: candidate.officialUrl ?? "",
    category_text: candidate.categoryText ?? "",
    mapped_category: candidate.mappedCategory ?? "",
    rating: candidate.rating,
    review_count: candidate.reviewCount,
    pricing_signals: candidate.pricingSignals,
    normalized_name: candidate.normalizedName,
    normalized_official_host: candidate.normalizedOfficialHost ?? "",
    confidence: candidate.confidence,
    matched_tool_slug: existingTool?.slug ?? "",
    notes: "",
    last_seen_at: new Date(),
    $setOnInsert: {
      first_seen_at: new Date(),
    },
  };

  const ingestion = await CompetitorIngestion.findOneAndUpdate(
    { source: candidate.source, source_url: candidate.sourceUrl },
    update,
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  return {
    status: ingestion.status as "pending" | "needs_review" | "upserted",
    ingestionId: String(ingestion._id),
    matchedToolSlug: ingestion.matched_tool_slug || undefined,
  };
}

export async function upsertToolFromIngestion(ingestionId: string) {
  const ingestion = await CompetitorIngestion.findById(ingestionId).lean();
  if (!ingestion) throw new Error(`Ingestion record ${ingestionId} not found`);
  if (ingestion.status === "needs_review") return { skipped: true, reason: "needs_review" };

  const score = ratingToOverallScore(ingestion.rating);
  const matched = ingestion.matched_tool_slug
    ? await Tool.findOne({ slug: ingestion.matched_tool_slug }).lean()
    : null;

  if (matched) {
    await Tool.findByIdAndUpdate(matched._id, {
      ...(ingestion.official_url ? { official_url: ingestion.official_url } : {}),
      ...(ingestion.mapped_category ? { category: ingestion.mapped_category } : {}),
      overall_score: score,
      rating_label: resolveRatingLabel(score),
      short_description:
        matched.short_description || toolDescription(ingestion.name, ingestion.source),
    });

    await CompetitorIngestion.findByIdAndUpdate(ingestionId, {
      status: "upserted",
      matched_tool_slug: matched.slug,
      notes: "Updated existing tool",
    });

    return { skipped: false, toolSlug: matched.slug, action: "updated" as const };
  }

  const baseSlug = slugify(ingestion.slug_candidate || ingestion.name);
  const slug = await ensureUniqueSlug(baseSlug);
  const created = await Tool.create({
    name: ingestion.name,
    slug,
    category: ingestion.mapped_category || "Uncategorized",
    official_url: ingestion.official_url || undefined,
    overall_score: score,
    rating_label: resolveRatingLabel(score),
    short_description: toolDescription(ingestion.name, ingestion.source),
    is_featured: false,
    is_editors_pick: false,
    pricing_tiers: [],
    metrics: [],
  });

  await CompetitorIngestion.findByIdAndUpdate(ingestionId, {
    status: "upserted",
    matched_tool_slug: created.slug,
    notes: "Created new tool",
  });

  return { skipped: false, toolSlug: created.slug, action: "created" as const };
}

export async function listIngestionQueue(options?: {
  source?: CompetitorSource;
  status?: "pending" | "needs_review" | "upserted" | "skipped" | "error";
  limit?: number;
}) {
  const query: Record<string, unknown> = {};
  if (options?.source) query.source = options.source;
  if (options?.status) query.status = options.status;
  const limit = Math.min(options?.limit ?? 100, 500);
  return CompetitorIngestion.find(query).sort({ updatedAt: -1 }).limit(limit).lean();
}

export async function getIngestionSummary() {
  const grouped = await CompetitorIngestion.aggregate([
    {
      $group: {
        _id: { source: "$source", status: "$status" },
        count: { $sum: 1 },
      },
    },
  ]);

  const totals = await CompetitorIngestion.aggregate([
    {
      $group: {
        _id: null,
        discovered: { $sum: 1 },
        highConfidence: {
          $sum: { $cond: [{ $gte: ["$confidence", UPSERT_CONFIDENCE_THRESHOLD] }, 1, 0] },
        },
      },
    },
  ]);

  return {
    totals: totals[0] ?? { discovered: 0, highConfidence: 0 },
    breakdown: grouped,
    threshold: UPSERT_CONFIDENCE_THRESHOLD,
  };
}
