import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tool from "@/lib/models/Tool";
import { submitUrlToIndexNow } from "@/lib/indexnow";
import { requireApiRole } from "@/lib/auth/api-auth";
import { pickFields, TOOL_FIELDS } from "@/lib/validation";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saasaudited.com";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireApiRole("editor");
  if (error) return error;

  await dbConnect();
  const { id } = await params;
  const tool = await Tool.findById(id).lean();
  if (!tool) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ tool });
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
    const body = pickFields(await request.json(), TOOL_FIELDS);
    const tool = await Tool.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!tool)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Notify search engines
    if (tool.slug) {
      submitUrlToIndexNow(`${BASE_URL}/reviews/${tool.slug}`).catch((err) =>
        console.warn("[IndexNow] tool update submit failed:", err)
      );
    }

    return NextResponse.json({ tool });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update tool";
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
  const result = await Tool.findByIdAndDelete(id);
  if (!result)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
