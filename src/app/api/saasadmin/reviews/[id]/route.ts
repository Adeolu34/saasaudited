import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Review from "@/lib/models/Review";
import { submitUrlToIndexNow } from "@/lib/indexnow";
import { requireApiRole } from "@/lib/auth/api-auth";
import { pickFields, REVIEW_FIELDS } from "@/lib/validation";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saasaudited.com";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireApiRole("editor");
  if (error) return error;

  await dbConnect();
  const { id } = await params;
  const review = await Review.findById(id).lean();
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ review });
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
    const body = pickFields(await request.json(), REVIEW_FIELDS);
    const review = await Review.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Notify search engines
    if (review.slug) {
      submitUrlToIndexNow(`${BASE_URL}/reviews/${review.slug}`).catch((err) =>
        console.warn("[IndexNow] review update submit failed:", err)
      );
    }

    return NextResponse.json({ review });
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
  const result = await Review.findByIdAndDelete(id);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
