import mongoose, { Schema, Document } from "mongoose";

export interface IAuthor extends Document {
  name: string;
  bio: string;
  image: string;
  role: string;
  content_types: string[];
}

const AuthorSchema = new Schema<IAuthor>(
  {
    name: { type: String, required: true, unique: true },
    bio: { type: String, default: "" },
    image: { type: String, default: "" },
    role: { type: String, default: "Staff Writer" },
    content_types: { type: [String], default: ["blog"] },
  },
  { timestamps: true }
);

export default mongoose.models.Author ||
  mongoose.model<IAuthor>("Author", AuthorSchema);
