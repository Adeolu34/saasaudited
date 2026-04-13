import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Review from "@/lib/models/Review";
import { submitUrlToIndexNow } from "@/lib/indexnow";
import { requireApiRole } from "@/lib/auth/api-auth";
import { pickFields, clampPage, REVIEW_FIELDS } from "@/lib/validation";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saasaudited.com";

export async function GET(request: NextRequest) {
  const { error } = await requireApiRole("editor");
  if (error) return error;

  await dbConnect();
  const q = request.nextUrl.searchParams.get("q") || "";
  const page = clampPage(request.nextUrl.searchParams.get("page"));
  const limit = 20;
  const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = safeQ ? { title: { $regex: safeQ, $options: "i" } } : {};
  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Review.countDocuments(filter),
  ]);
  return NextResponse.json({ reviews, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const { error } = await requireApiRole("editor");
  if (error) return error;

  try {
    await dbConnect();
    const body = pickFields(await request.json(), REVIEW_FIELDS);
    const review = await Review.create(body);

    // Notify search engines about new review page
    if (review.slug) {
      submitUrlToIndexNow(`${BASE_URL}/reviews/${review.slug}`).catch((err) =>
        console.warn("[IndexNow] review submit failed:", err)
      );
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
