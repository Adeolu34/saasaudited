import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/lib/models/BlogPost";
import { generateImage } from "@/lib/ai/image";
import { buildBlogImageContext, insertInlineImageIntoBlogContent } from "@/lib/ai/blog-images";

export const maxDuration = 300; // Allow up to 5 minutes for bulk generation

export async function POST() {
  try {
    await dbConnect();

    // Find all blog posts missing a featured image (empty, null, or non-string)
    const posts = await BlogPost.find({
      $or: [
        { featured_image: { $exists: false } },
        { featured_image: null },
        { featured_image: "" },
        { featured_image: { $type: "object" } },
      ],
    })
      .select("_id title excerpt content category tags")
      .lean();

    if (posts.length === 0) {
      return NextResponse.json({ message: "All posts already have images", generated: 0 });
    }

    const results: { id: string; title: string; status: string; url?: string; error?: string }[] = [];

    for (const post of posts) {
      try {
        const context = buildBlogImageContext({
          title: post.title,
          category: typeof post.category === "string" ? post.category : undefined,
          excerpt: typeof post.excerpt === "string" ? post.excerpt : undefined,
          content: typeof post.content === "string" ? post.content : undefined,
          tags: Array.isArray(post.tags)
            ? post.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 6)
            : undefined,
        });

        const url = await generateImage({
          title: post.title,
          contentType: "blog",
          variant: "featured",
          context,
        });

        let updatedContent = post.content;
        if (typeof post.content === "string" && !post.content.includes("post-inline-image")) {
          const inlineUrl = await generateImage({
            title: `${post.title} (inline)`,
            contentType: "blog",
            variant: "inline",
            context,
          });
          updatedContent = insertInlineImageIntoBlogContent(
            post.content,
            inlineUrl,
            `Illustration for ${post.title}`
          );
        }

        await BlogPost.updateOne({ _id: post._id }, { $set: { featured_image: url } });
        if (typeof updatedContent === "string" && updatedContent !== post.content) {
          await BlogPost.updateOne({ _id: post._id }, { $set: { content: updatedContent } });
        }
        results.push({ id: String(post._id), title: post.title, status: "success", url });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed";
        results.push({ id: String(post._id), title: post.title, status: "error", error: message });
      }
    }

    const succeeded = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "error").length;

    return NextResponse.json({
      message: `Generated ${succeeded} images, ${failed} failed`,
      generated: succeeded,
      failed,
      results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bulk image generation failed";
    console.error("[AI Bulk Image]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
