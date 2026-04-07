import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comment from "@/lib/models/Comment";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const comment = await Comment.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true, runValidators: true }
    ).lean();
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ comment });
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
  const result = await Comment.findByIdAndDelete(id);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
