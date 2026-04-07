import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  featured_tools: string[];
  review_count: number;
  faq: { question: string; answer: string }[];
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon_name: { type: String, default: "category" },
    featured_tools: [String],
    review_count: { type: Number, default: 0 },
    faq: [{ question: String, answer: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
