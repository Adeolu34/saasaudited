import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tool from "@/lib/models/Tool";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q");
  const category = searchParams.get("category");

  await dbConnect();

  const filter: Record<string, unknown> = {};

  if (query && typeof query === "string") {
    const sanitized = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.name = { $regex: sanitized, $options: "i" };
  }

  if (category && typeof category === "string") {
    filter.category = category;
  }

  const tools = await Tool.find(filter, {
    name: 1,
    slug: 1,
    category: 1,
    overall_score: 1,
    logo_url: 1,
    _id: 0,
  })
    .sort({ name: 1 })
    .limit(20)
    .lean();

  return NextResponse.json(tools);
}
