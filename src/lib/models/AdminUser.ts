import mongoose, { Schema, Document } from "mongoose";

export interface IAdminUser extends Document {
  email: string;
  password_hash: string;
  name: string;
  role: "superadmin" | "admin" | "editor";
  is_active: boolean;
  last_login_at?: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["superadmin", "admin", "editor"],
      default: "editor",
    },
    is_active: { type: Boolean, default: true },
    last_login_at: Date,
  },
  { timestamps: true }
);


export default mongoose.models.AdminUser ||
  mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);
