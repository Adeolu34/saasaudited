import mongoose, { Schema, Document } from "mongoose";

export interface IApiKey extends Document {
  name: string;
  key_prefix: string;
  key_hash: string;
  scopes: string[];
  is_active: boolean;
  last_used_at?: Date;
  expires_at?: Date;
  created_by: mongoose.Types.ObjectId;
  usage_count: number;
  rate_limit: number;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    name: { type: String, required: true },
    key_prefix: { type: String, required: true },
    key_hash: { type: String, required: true, unique: true },
    scopes: [{ type: String }],
    is_active: { type: Boolean, default: true },
    last_used_at: Date,
    expires_at: Date,
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
    usage_count: { type: Number, default: 0 },
    rate_limit: { type: Number, default: 60 },
  },
  { timestamps: true }
);

export default mongoose.models.ApiKey ||
  mongoose.model<IApiKey>("ApiKey", ApiKeySchema);
