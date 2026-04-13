import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ApiKey from "@/lib/models/ApiKey";
import { requireApiRole } from "@/lib/auth/api-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireApiRole("admin");
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const update: Record<string, unknown> = {};
    if (body.name !== undefined) update.name = body.name;
    if (body.scopes !== undefined) update.scopes = body.scopes;
    if (body.is_active !== undefined) update.is_active = body.is_active;
    if (body.rate_limit !== undefined) update.rate_limit = body.rate_limit;

    const key = await ApiKey.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!key) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ key });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireApiRole("admin");
  if (error) return error;

  await dbConnect();
  const { id } = await params;
  const result = await ApiKey.findByIdAndDelete(id);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
