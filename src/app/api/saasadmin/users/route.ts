import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import AdminUser from "@/lib/models/AdminUser";
import { requireApiRole } from "@/lib/auth/api-auth";

export async function GET() {
  const { error } = await requireApiRole("admin");
  if (error) return error;

  await dbConnect();
  const users = await AdminUser.find()
    .select("-password_hash")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireApiRole("admin");
  if (error) return error;

  try {
    await dbConnect();
    const body = await request.json();
    const { email, password, name, role } = body;
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 });
    }

    // Privilege escalation guard: only superadmin can create superadmin users
    if (role === "superadmin" && session.role !== "superadmin") {
      return NextResponse.json({ error: "Only superadmins can create superadmin users" }, { status: 403 });
    }

    const existing = await AdminUser.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    const password_hash = await bcrypt.hash(password, 12);
    const user = await AdminUser.create({
      email,
      password_hash,
      name,
      role: role || "editor",
    });
    return NextResponse.json(
      { user: { _id: user._id, email, name, role: user.role } },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create user";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
