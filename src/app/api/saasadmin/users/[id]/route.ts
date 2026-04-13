import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import AdminUser from "@/lib/models/AdminUser";
import { requireApiRole } from "@/lib/auth/api-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireApiRole("admin");
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Privilege escalation guard: only superadmin can set role to superadmin
    if (body.role === "superadmin" && session.role !== "superadmin") {
      return NextResponse.json({ error: "Only superadmins can assign superadmin role" }, { status: 403 });
    }

    const update: Record<string, unknown> = {};
    if (body.name) update.name = body.name;
    if (body.email) update.email = body.email;
    if (body.role) update.role = body.role;
    if (body.is_active !== undefined) update.is_active = body.is_active;
    if (body.password) update.password_hash = await bcrypt.hash(body.password, 12);

    const user = await AdminUser.findByIdAndUpdate(id, update, { new: true })
      .select("-password_hash")
      .lean();
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireApiRole("superadmin");
  if (error) return error;

  const { id } = await params;

  // Prevent self-deletion
  if (session.userId === id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  await dbConnect();
  const result = await AdminUser.findByIdAndDelete(id);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
