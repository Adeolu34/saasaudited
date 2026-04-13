import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Review from "@/lib/models/Review";
import { submitUrlToIndexNow } from "@/lib/indexnow";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saasaudited.com";

export async function GET(request: NextRequest) {
  await dbConnect();
  const q = request.nextUrl.searchParams.get("q") || "";
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const limit = 20;
  const filter = q ? { title: { $regex: q, $options: "i" } } : {};
  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Review.countDocuments(filter),
  ]);
  return NextResponse.json({ reviews, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const review = await Review.create(body);

    // Notify search engines about new review page
    if (review.slug) {
      submitUrlToIndexNow(`${BASE_URL}/reviews/${review.slug}`).catch(() => {});
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
