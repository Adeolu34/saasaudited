import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/lib/models/BlogPost";
import { submitUrlToIndexNow } from "@/lib/indexnow";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saasaudited.com";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  const post = await BlogPost.findById(id).lean();
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Fix bad data: featured_image should be a string, not an object
  if (post.featured_image && typeof post.featured_image !== "string") {
    await BlogPost.updateOne({ _id: id }, { $set: { featured_image: "" } });
    post.featured_image = "";
  }

  return NextResponse.json({ post });
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = sanitizeBody(await request.json());

    // Check if this update is publishing a draft (status changing to "published")
    const previousPost = await BlogPost.findById(id, { status: 1, slug: 1 }).lean();
    const isPublishing =
      previousPost?.status === "draft" &&
      (body.status === "published" || (!body.status && previousPost.status === "draft"));

    const post = await BlogPost.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Notify search engines when a post is published or updated
    if (post.slug && post.status !== "draft") {
      submitUrlToIndexNow(`${BASE_URL}/blog/${post.slug}`).catch(() => {});
    }

    return NextResponse.json({ post, published: isPublishing });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  const result = await BlogPost.findByIdAndDelete(id);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
