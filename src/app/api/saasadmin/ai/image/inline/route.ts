import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/lib/models/BlogPost";
import { generateImage } from "@/lib/ai/image";
import { buildBlogImageContext, insertInlineImageIntoBlogContent } from "@/lib/ai/blog-images";
import { checkRateLimit } from "@/lib/ai/rate-limiter";

/**
 * POST /api/saasadmin/ai/image/inline
 *
 * Generate and insert an inline image for an existing blog post.
 * Body: { postId: string }
 *
 * If the post already has an inline image, it will be skipped unless force=true.
 */
export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit("ai-image-inline")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a minute." },
        { status: 429 }
      );
    }

    const { postId, force } = await request.json();
    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    await dbConnect();
    const post = await BlogPost.findById(postId).lean();
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if post already has an inline image
    if (!force && post.content?.includes("post-inline-image")) {
      return NextResponse.json({
        message: "Post already has an inline image. Use force=true to regenerate.",
        skipped: true,
      });
    }

    if (!post.content || !post.title) {
      return NextResponse.json({ error: "Post has no content" }, { status: 400 });
    }

    // Strip any existing inline images before inserting a new one
    let content = post.content.replace(
      /<figure class="post-inline-image">[\s\S]*?<\/figure>\s*/g,
      ""
    );

    const imageContext = buildBlogImageContext({
      title: post.title,
      category: post.category,
      excerpt: post.excerpt,
      content,
      tags: post.tags?.slice(0, 6),
    });

    const inlineUrl = await generateImage({
      title: `${post.title} (inline)`,
      contentType: "blog",
      variant: "inline",
      context: imageContext,
    });

    content = insertInlineImageIntoBlogContent(
      content,
      inlineUrl,
      `Illustration for ${post.title}`
    );

    await BlogPost.findByIdAndUpdate(postId, { content });

    return NextResponse.json({
      success: true,
      imageUrl: inlineUrl,
      postId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Inline image generation failed";
    console.error("[AI Inline Image]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
