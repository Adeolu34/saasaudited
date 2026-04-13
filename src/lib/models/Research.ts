import mongoose, { Schema, Document } from "mongoose";

export interface IResearch extends Document {
  topic: string;
  keywords: string[];
  search_data: string;
  suggested_angle: string;
  suggested_category: string;
  status: "pending" | "used";
  created_at: Date;
}

const ResearchSchema = new Schema<IResearch>(
  {
    topic: { type: String, required: true },
    keywords: { type: [String], default: [] },
    search_data: { type: String, default: "" },
    suggested_angle: { type: String, default: "" },
    suggested_category: { type: String, default: "" },
    status: { type: String, enum: ["pending", "used"], default: "pending" },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ResearchSchema.index({ status: 1, created_at: 1 });

export default mongoose.models.Research ||
  mongoose.model<IResearch>("Research", ResearchSchema);
