import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/lib/models/BlogPost";

export async function GET(request: NextRequest) {
  await dbConnect();
  const q = request.nextUrl.searchParams.get("q") || "";
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const limit = 20;
  const filter = q ? { title: { $regex: q, $options: "i" } } : {};
  const [posts, total] = await Promise.all([
    BlogPost.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    BlogPost.countDocuments(filter),
  ]);
  return NextResponse.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const post = await BlogPost.create(body);
    return NextResponse.json({ post }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
