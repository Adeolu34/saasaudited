import mongoose, { Schema, Document } from "mongoose";

export interface IAiSettings extends Document {
  config_key: string;
  // Global model configuration
  ai_model?: string;
  temperature?: number;
  max_tokens?: number;
  // Per-content-type prompt overrides
  system_prompt?: string;
  user_prompt_template?: string;
  // Topic pool for cron (global only)
  topic_pool?: string[];
  // Search settings (global only)
  search_enabled?: boolean;
  search_queries?: string[];
  // Image settings (global only)
  auto_generate_images?: boolean;
}

const AiSettingsSchema = new Schema<IAiSettings>(
  {
    config_key: {
      type: String,
      required: true,
      unique: true,
      enum: ["global", "blog", "tool", "review", "comparison", "category"],
    },
    ai_model: String,
    temperature: Number,
    max_tokens: Number,
    system_prompt: String,
    user_prompt_template: String,
    topic_pool: [String],
    search_enabled: Boolean,
    search_queries: [String],
    auto_generate_images: Boolean,
  },
  { timestamps: true }
);

export default mongoose.models.AiSettings ||
  mongoose.model<IAiSettings>("AiSettings", AiSettingsSchema);
