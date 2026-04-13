import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/lib/models/BlogPost";
import { submitUrlToIndexNow } from "@/lib/indexnow";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saasaudited.com";

export async function GET(request: NextRequest) {
  await dbConnect();

  // One-time cleanup: fix any records where featured_image is not a string
  await BlogPost.updateMany(
    { featured_image: { $type: "object" } },
    { $set: { featured_image: "" } }
  );

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

/** Sanitize fields that must be strings — AI sometimes returns {} or [] */
function sanitizeBody(body: Record<string, unknown>) {
  for (const key of ["featured_image", "logo_url"]) {
    if (body[key] && typeof body[key] !== "string") {
      body[key] = "";
    }
  }
  return body;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = sanitizeBody(await request.json());
    const post = await BlogPost.create(body);

    // Notify search engines if the post is published (not a draft)
    if (post.slug && post.status !== "draft") {
      submitUrlToIndexNow(`${BASE_URL}/blog/${post.slug}`).catch(() => {});
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
