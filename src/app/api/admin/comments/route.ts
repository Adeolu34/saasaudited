import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comment from "@/lib/models/Comment";

export async function GET(request: NextRequest) {
  await dbConnect();
  const status = request.nextUrl.searchParams.get("status") || "";
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const limit = 20;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  const [comments, total] = await Promise.all([
    Comment.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Comment.countDocuments(filter),
  ]);
  return NextResponse.json({ comments, total, page, totalPages: Math.ceil(total / limit) });
}
