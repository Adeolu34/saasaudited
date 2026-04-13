import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comparison from "@/lib/models/Comparison";
import { requireApiRole } from "@/lib/auth/api-auth";
import { pickFields, COMPARISON_FIELDS } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireApiRole("editor");
  if (error) return error;

  await dbConnect();
  const { id } = await params;
  const comparison = await Comparison.findById(id).lean();
  if (!comparison) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ comparison });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireApiRole("editor");
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const body = pickFields(await request.json(), COMPARISON_FIELDS);
    const comparison = await Comparison.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!comparison) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ comparison });
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
  const result = await Comparison.findByIdAndDelete(id);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
