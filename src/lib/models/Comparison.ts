import mongoose, { Schema, Document } from "mongoose";

export interface IComparison extends Document {
  slug: string;
  title: string;
  tool_a_slug: string;
  tool_b_slug: string;
  tldr: { title: string; description: string }[];
  features: {
    name: string;
    tool_a: string;
    tool_b: string;
    winner?: "a" | "b" | "tie";
  }[];
  winner: string;
  decision_criteria: { title: string; items: string[] }[];
  body_content: string;
}

const ComparisonSchema = new Schema<IComparison>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    tool_a_slug: { type: String, required: true },
    tool_b_slug: { type: String, required: true },
    tldr: [{ title: String, description: String }],
    features: [{ name: String, tool_a: String, tool_b: String, winner: String }],
    winner: String,
    decision_criteria: [{ title: String, items: [String] }],
    body_content: { type: String, default: "" },
  },
  { timestamps: true }
);

ComparisonSchema.index({ tool_a_slug: 1 });
ComparisonSchema.index({ tool_b_slug: 1 });

export default mongoose.models.Comparison ||
  mongoose.model<IComparison>("Comparison", ComparisonSchema);
