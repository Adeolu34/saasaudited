import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  type: "api_request" | "error" | "admin_action";
  method?: string;
  path: string;
  status_code?: number;
  admin_user_id?: mongoose.Types.ObjectId;
  api_key_id?: mongoose.Types.ObjectId;
  ip_address?: string;
  error_message?: string;
  error_stack?: string;
  metadata?: Record<string, unknown>;
  duration_ms?: number;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    type: {
      type: String,
      enum: ["api_request", "error", "admin_action"],
      required: true,
    },
    method: String,
    path: { type: String, required: true },
    status_code: Number,
    admin_user_id: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    api_key_id: { type: Schema.Types.ObjectId, ref: "ApiKey" },
    ip_address: String,
    error_message: String,
    error_stack: String,
    metadata: Schema.Types.Mixed,
    duration_ms: Number,
  },
  { timestamps: true }
);

AuditLogSchema.index({ type: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
