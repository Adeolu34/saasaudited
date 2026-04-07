import mongoose, { Schema, Document } from "mongoose";

export interface ITool extends Document {
  name: string;
  slug: string;
  category: string;
  logo_url?: string;
  official_url?: string;
  overall_score: number;
  rating_label: string;
  short_description: string;
  is_featured: boolean;
  is_editors_pick: boolean;
  pricing_tiers: { name: string; price: string }[];
  metrics: { label: string; value: number }[];
}

const ToolSchema = new Schema<ITool>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    logo_url: String,
    official_url: String,
    overall_score: { type: Number, required: true },
    rating_label: { type: String, default: "Good" },
    short_description: { type: String, required: true },
    is_featured: { type: Boolean, default: false },
    is_editors_pick: { type: Boolean, default: false },
    pricing_tiers: [{ name: String, price: String }],
    metrics: [{ label: String, value: Number }],
  },
  { timestamps: true }
);

ToolSchema.index({ is_featured: 1 });
ToolSchema.index({ category: 1, overall_score: -1 });
ToolSchema.index({ is_editors_pick: 1 });

export default mongoose.models.Tool || mongoose.model<ITool>("Tool", ToolSchema);
