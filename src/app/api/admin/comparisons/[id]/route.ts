import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comparison from "@/lib/models/Comparison";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
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
  await dbConnect();
  const { id } = await params;
  const result = await Comparison.findByIdAndDelete(id);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
