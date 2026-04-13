import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Research from "@/lib/models/Research";
import { requireApiRole } from "@/lib/auth/api-auth";
import { pickFields, RESEARCH_PUT_FIELDS } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireApiRole("editor");
  if (error) return error;

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
  const { error } = await requireApiRole("editor");
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const body = pickFields(await request.json(), RESEARCH_PUT_FIELDS);

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
  const { error } = await requireApiRole("admin");
  if (error) return error;

  await dbConnect();
  const { id } = await params;
  const result = await Research.findByIdAndDelete(id);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
