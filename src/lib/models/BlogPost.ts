import mongoose, { Schema, Document } from "mongoose";

export interface IBlogPost extends Document {
  slug?: string;
  title?: string;
  category?: string;
  author?: { name?: string; image?: string; bio?: string };
  excerpt?: string;
  content?: string;
  featured_image?: string;
  tags: string[];
  toc: { title: string; anchor: string }[];
  read_time: number;
  is_featured: boolean;
  status: "draft" | "published";
  published_at: Date;
}

function requiredForPublished(this: IBlogPost) {
  return this.status === "published";
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    slug: { type: String, required: requiredForPublished, unique: true, sparse: true },
    title: { type: String, required: requiredForPublished },
    category: { type: String, required: requiredForPublished },
    author: {
      name: { type: String, required: requiredForPublished },
      image: String,
      bio: String,
    },
    excerpt: { type: String, required: requiredForPublished },
    content: { type: String, required: requiredForPublished },
    featured_image: String,
    tags: [String],
    toc: [{ title: String, anchor: String }],
    read_time: { type: Number, default: 5 },
    is_featured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    published_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

BlogPostSchema.index({ is_featured: 1 });
BlogPostSchema.index({ published_at: -1 });
BlogPostSchema.index({ status: 1, published_at: -1 });

export default mongoose.models.BlogPost ||
  mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
