import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/lib/models/BlogPost";
import { submitUrlToIndexNow } from "@/lib/indexnow";
import { sanitizeBody } from "@/lib/sanitize";
import { requireApiRole } from "@/lib/auth/api-auth";
import { pickFields, clampPage, BLOG_POST_FIELDS } from "@/lib/validation";

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
  const [posts, total] = await Promise.all([
    BlogPost.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    BlogPost.countDocuments(filter),
  ]);
  return NextResponse.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const { error } = await requireApiRole("editor");
  if (error) return error;

  try {
    await dbConnect();
    const body = sanitizeBody(pickFields(await request.json(), BLOG_POST_FIELDS));
    const post = await BlogPost.create(body);

    // Notify search engines if the post is published (not a draft)
    if (post.slug && post.status !== "draft") {
      submitUrlToIndexNow(`${BASE_URL}/blog/${post.slug}`).catch((err) =>
        console.warn("[IndexNow] blog submit failed:", err)
      );
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
