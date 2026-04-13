import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Research from "@/lib/models/Research";

export async function GET(request: NextRequest) {
  await dbConnect();

  const status = request.nextUrl.searchParams.get("status");
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const limit = 20;

  const filter: Record<string, unknown> = {};
  if (status && (status === "pending" || status === "used")) {
    filter.status = status;
  }

  const [items, total] = await Promise.all([
    Research.find(filter)
      .sort({ status: 1, created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Research.countDocuments(filter),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const research = await Research.create({
      topic: body.topic,
      keywords: body.keywords || [],
      search_data: body.search_data || "",
      suggested_angle: body.suggested_angle || "",
      suggested_category: body.suggested_category || "Strategy",
      status: "pending",
    });

    return NextResponse.json({ research }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create research";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
