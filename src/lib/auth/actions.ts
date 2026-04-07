"use server";

import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import AdminUser from "@/lib/models/AdminUser";
import { createSession, deleteSession } from "./session";
import { redirect } from "next/navigation";

export async function loginAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Email and password are required." };
  }

  await dbConnect();
  const user = await AdminUser.findOne({ email, is_active: true });

  if (!user) {
    return { error: "Invalid email or password." };
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  // Update last login
  await AdminUser.updateOne(
    { _id: user._id },
    { last_login_at: new Date() }
  );

  await createSession({
    userId: user._id.toString(),
    role: user.role,
    name: user.name,
    email: user.email,
  });

  redirect("/admin");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/admin/login");
}
