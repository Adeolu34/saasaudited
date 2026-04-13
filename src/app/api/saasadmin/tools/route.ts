import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tool from "@/lib/models/Tool";
import { submitUrlToIndexNow } from "@/lib/indexnow";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saasaudited.com";

export async function GET(request: NextRequest) {
  await dbConnect();
  const q = request.nextUrl.searchParams.get("q") || "";
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const limit = 20;
  const filter = q ? { name: { $regex: q, $options: "i" } } : {};
  const [tools, total] = await Promise.all([
    Tool.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Tool.countDocuments(filter),
  ]);
  return NextResponse.json({
    tools,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const tool = await Tool.create(body);

    // Notify search engines about new tool page
    if (tool.slug) {
      submitUrlToIndexNow(`${BASE_URL}/reviews/${tool.slug}`).catch(() => {});
    }

    return NextResponse.json({ tool }, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create tool";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
