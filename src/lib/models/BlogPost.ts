import mongoose, { Schema, Document } from "mongoose";

export interface IBlogPost extends Document {
  slug: string;
  title: string;
  category: string;
  author: { name: string; image?: string; bio?: string };
  excerpt: string;
  content: string;
  featured_image?: string;
  tags: string[];
  toc: { title: string; anchor: string }[];
  read_time: number;
  is_featured: boolean;
  published_at: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    author: {
      name: { type: String, required: true },
      image: String,
      bio: String,
    },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    featured_image: String,
    tags: [String],
    toc: [{ title: String, anchor: String }],
    read_time: { type: Number, default: 5 },
    is_featured: { type: Boolean, default: false },
    published_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

BlogPostSchema.index({ is_featured: 1 });
BlogPostSchema.index({ published_at: -1 });

export default mongoose.models.BlogPost ||
  mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
