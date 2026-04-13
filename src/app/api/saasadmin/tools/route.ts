import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tool from "@/lib/models/Tool";
import { submitUrlToIndexNow } from "@/lib/indexnow";
import { requireApiRole } from "@/lib/auth/api-auth";
import { pickFields, clampPage, TOOL_FIELDS } from "@/lib/validation";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saasaudited.com";

export async function GET(request: NextRequest) {
  const { error } = await requireApiRole("editor");
  if (error) return error;

  await dbConnect();
  const q = request.nextUrl.searchParams.get("q") || "";
  const page = clampPage(request.nextUrl.searchParams.get("page"));
  const limit = 20;
  const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = safeQ ? { name: { $regex: safeQ, $options: "i" } } : {};
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
  const { error } = await requireApiRole("editor");
  if (error) return error;

  try {
    await dbConnect();
    const body = pickFields(await request.json(), TOOL_FIELDS);
    const tool = await Tool.create(body);

    // Notify search engines about new tool page
    if (tool.slug) {
      submitUrlToIndexNow(`${BASE_URL}/reviews/${tool.slug}`).catch((err) =>
        console.warn("[IndexNow] tool submit failed:", err)
      );
    }

    return NextResponse.json({ tool }, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create tool";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
