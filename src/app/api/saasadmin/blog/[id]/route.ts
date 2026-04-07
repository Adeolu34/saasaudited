import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/lib/models/BlogPost";

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
    const post = await BlogPost.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ post });
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
