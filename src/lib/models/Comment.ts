import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  target_type: "review" | "blog";
  target_slug: string;
  author_name: string;
  author_email: string;
  content: string;
  status: "pending" | "approved" | "rejected" | "spam";
  ip_address?: string;
  parent_id?: mongoose.Types.ObjectId;
}

const CommentSchema = new Schema<IComment>(
  {
    target_type: {
      type: String,
      enum: ["review", "blog"],
      required: true,
    },
    target_slug: { type: String, required: true },
    author_name: { type: String, required: true },
    author_email: { type: String, required: true },
    content: { type: String, required: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "spam"],
      default: "pending",
    },
    ip_address: String,
    parent_id: { type: Schema.Types.ObjectId, ref: "Comment" },
  },
  { timestamps: true }
);

CommentSchema.index({ target_type: 1, target_slug: 1, status: 1 });
CommentSchema.index({ status: 1 });
CommentSchema.index({ createdAt: -1 });

export default mongoose.models.Comment ||
  mongoose.model<IComment>("Comment", CommentSchema);
