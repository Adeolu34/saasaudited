import mongoose, { Document, Schema } from "mongoose";
import { COMPETITOR_SOURCES } from "@/lib/competitors/types";

const INGESTION_STATUSES = [
  "pending",
  "needs_review",
  "upserted",
  "skipped",
  "error",
] as const;

export interface ICompetitorIngestion extends Document {
  source: (typeof COMPETITOR_SOURCES)[number];
  source_url: string;
  page_type: "list" | "product" | "review" | "comparison" | "other";
  status: (typeof INGESTION_STATUSES)[number];
  source_tool_id: string;
  name: string;
  slug_candidate: string;
  official_url: string;
  category_text: string;
  mapped_category: string;
  rating: number | null;
  review_count: number | null;
  pricing_signals: string[];
  normalized_name: string;
  normalized_official_host: string;
  confidence: number;
  matched_tool_slug: string;
  notes: string;
  first_seen_at: Date;
  last_seen_at: Date;
}

const CompetitorIngestionSchema = new Schema<ICompetitorIngestion>(
  {
    source: { type: String, enum: [...COMPETITOR_SOURCES], required: true },
    source_url: { type: String, required: true },
    page_type: {
      type: String,
      enum: ["list", "product", "review", "comparison", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: [...INGESTION_STATUSES],
      default: "pending",
      required: true,
    },
    source_tool_id: { type: String, default: "" },
    name: { type: String, required: true },
    slug_candidate: { type: String, required: true },
    official_url: { type: String, default: "" },
    category_text: { type: String, default: "" },
    mapped_category: { type: String, default: "" },
    rating: { type: Number, default: null },
    review_count: { type: Number, default: null },
    pricing_signals: [{ type: String }],
    normalized_name: { type: String, default: "" },
    normalized_official_host: { type: String, default: "" },
    confidence: { type: Number, default: 0 },
    matched_tool_slug: { type: String, default: "" },
    notes: { type: String, default: "" },
    first_seen_at: { type: Date, default: Date.now },
    last_seen_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CompetitorIngestionSchema.index({ source: 1, source_url: 1 }, { unique: true });
CompetitorIngestionSchema.index({ status: 1, source: 1, updatedAt: -1 });
CompetitorIngestionSchema.index({ normalized_name: 1, normalized_official_host: 1 });

export default mongoose.models.CompetitorIngestion ||
  mongoose.model<ICompetitorIngestion>("CompetitorIngestion", CompetitorIngestionSchema);
