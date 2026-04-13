import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Research from "@/lib/models/Research";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  const research = await Research.findById(id).lean();
  if (!research) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ research });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const research = await Research.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!research) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ research });
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
  const result = await Research.findByIdAndDelete(id);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
