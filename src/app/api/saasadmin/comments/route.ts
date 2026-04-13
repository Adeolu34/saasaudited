import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comment from "@/lib/models/Comment";
import { requireApiRole } from "@/lib/auth/api-auth";
import { clampPage } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { error } = await requireApiRole("editor");
  if (error) return error;

  await dbConnect();
  const status = request.nextUrl.searchParams.get("status") || "";
  const page = clampPage(request.nextUrl.searchParams.get("page"));
  const limit = 20;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  const [comments, total] = await Promise.all([
    Comment.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Comment.countDocuments(filter),
  ]);
  return NextResponse.json({ comments, total, page, totalPages: Math.ceil(total / limit) });
}
