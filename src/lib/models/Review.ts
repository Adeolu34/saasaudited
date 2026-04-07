import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  tool_slug: string;
  slug: string;
  title: string;
  pros: string[];
  cons: string[];
  verdict: string;
  body_content: string;
  screenshots: string[];
  updated_at: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    tool_slug: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    pros: [String],
    cons: [String],
    verdict: { type: String, required: true },
    body_content: { type: String, required: true },
    screenshots: [String],
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Review ||
  mongoose.model<IReview>("Review", ReviewSchema);
