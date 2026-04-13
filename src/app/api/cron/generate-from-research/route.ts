import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Research from "@/lib/models/Research";
import BlogPost from "@/lib/models/BlogPost";
import { getOpenAI } from "@/lib/ai/openai";
import { generateImage } from "@/lib/ai/image";
import { parseAIResponse } from "@/lib/ai/parsers";
import { getGlobalSettings, getPromptOverrides, interpolateTemplate } from "@/lib/ai/settings";
import * as blogPrompts from "@/lib/ai/prompts/blog-post";
import { getAuthorForType } from "@/lib/ai/authors";
import { buildBlogImageContext, insertInlineImageIntoBlogContent } from "@/lib/ai/blog-images";

export const maxDuration = 300;

/**
 * The actual heavy work — runs in the background after the HTTP response is sent.
 * Safe on self-hosted Node.js (Coolify) where the process stays alive.
 */
async function runPipeline() {
  await dbConnect();
  const settings = await getGlobalSettings();
  const year = new Date().getFullYear();

  // Step 1: Find the oldest pending research
  const research = await Research.findOne({ status: "pending" })
    .sort({ created_at: 1 })
    .lean();

  if (!research) {
    console.log("[GenerateFromResearch] No pending research found.");
    return;
  }

  console.log(`[GenerateFromResearch] Using research: "${research.topic}" (${research._id})`);
  console.log(`[GenerateFromResearch] Keywords: ${research.keywords.join(", ")}`);

  // Step 2: Build the topic with angle for richer content
  const topic = research.suggested_angle
    ? `${research.topic}: ${research.suggested_angle}`
    : research.topic;

  // Step 3: Resolve prompts
  const overrides = await getPromptOverrides("blog");
  let systemPrompt: string;
  let userPrompt: string;

  if (overrides?.systemPrompt) {
    systemPrompt = overrides.systemPrompt;
  } else {
    systemPrompt = blogPrompts.buildSystemPrompt();
  }

  const author = await getAuthorForType("blog");

  if (overrides?.userPromptTemplate) {
    userPrompt = interpolateTemplate(overrides.userPromptTemplate, {
      topic,
      year: String(year),
      searchResults: research.search_data,
    });
  } else {
    userPrompt = blogPrompts.buildUserPrompt({
      topic,
      category: research.suggested_category || undefined,
      keywords: research.keywords,
      year: String(year),
      searchResults: research.search_data || undefined,
      author,
    });
  }

  // Step 4: Generate blog post via OpenAI
  console.log("[GenerateFromResearch] Generating blog post...");
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: settings.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: settings.max_tokens,
    temperature: settings.temperature,
    response_format: { type: "json_object" },
  });

  const rawContent = completion.choices[0]?.message?.content;
  if (!rawContent) {
    throw new Error("OpenAI returned empty response");
  }

  const blogData = parseAIResponse<Record<string, unknown>>(rawContent);

  // Sanitize image fields
  if (blogData.featured_image && typeof blogData.featured_image !== "string") {
    blogData.featured_image = "";
  }

  // Auto-extract TOC from content if AI didn't generate it
  if ((!blogData.toc || (blogData.toc as unknown[]).length === 0) && blogData.content) {
    const tocRegex = /<h2[^>]+id=["']([^"']+)["'][^>]*>(.*?)<\/h2>/gi;
    const toc: { title: string; anchor: string }[] = [];
    let m;
    while ((m = tocRegex.exec(blogData.content as string)) !== null) {
      toc.push({ anchor: m[1], title: m[2].replace(/<[^>]+>/g, "").trim() });
    }
    if (toc.length > 0) blogData.toc = toc;
  }

  // Auto-calculate read_time
  if (blogData.content) {
    const words = (blogData.content as string)
      .replace(/<[^>]+>/g, " ")
      .split(/\s+/)
      .filter(Boolean).length;
    blogData.read_time = Math.max(1, Math.ceil(words / 230));
  }

  // Save as DRAFT
  blogData.status = "draft";

  // Ensure slug uniqueness
  const existingSlug = await BlogPost.findOne({ slug: blogData.slug });
  if (existingSlug) {
    blogData.slug = `${blogData.slug}-${Date.now()}`;
  }

  const post = await BlogPost.create(blogData);

  // Mark research as used
  await Research.findByIdAndUpdate(research._id, { status: "used" });

  console.log(`[GenerateFromResearch] Draft saved: "${post.title}" (${post.slug})`);

  // Step 5: Generate images and update the post
  if (settings.auto_generate_images) {
    try {
      const title = blogData.title as string;
      const imageContext = buildBlogImageContext({
        title,
        category: typeof blogData.category === "string" ? blogData.category : undefined,
        excerpt: typeof blogData.excerpt === "string" ? blogData.excerpt : undefined,
        content: typeof blogData.content === "string" ? blogData.content : undefined,
        tags: Array.isArray(blogData.tags)
          ? blogData.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 6)
          : undefined,
      });

      const hasContent = typeof blogData.content === "string" && blogData.content.trim();

      const [featuredUrl, inlineUrl] = await Promise.all([
        generateImage({ title, contentType: "blog", variant: "featured", context: imageContext }),
        hasContent
          ? generateImage({ title: `${title} (inline)`, contentType: "blog", variant: "inline", context: imageContext })
          : Promise.resolve(null),
      ]);

      const update: Record<string, unknown> = {};
      if (featuredUrl) update.featured_image = featuredUrl;
      if (inlineUrl && typeof blogData.content === "string") {
        update.content = insertInlineImageIntoBlogContent(
          blogData.content,
          inlineUrl,
          `Illustration for ${title}`
        );
      }

      if (Object.keys(update).length > 0) {
        await BlogPost.findByIdAndUpdate(post._id, update);
        console.log(`[GenerateFromResearch] Images added to post ${post._id}`);
      }
    } catch (imgErr) {
      console.error("[GenerateFromResearch] Image generation failed:", imgErr);
    }
  }

  console.log(`[GenerateFromResearch] Pipeline complete for "${post.title}"`);
}

/**
 * POST /api/cron/generate-from-research
 *
 * Step 2 of the two-step blog pipeline.
 * Returns immediately (within ~2s) and runs the full pipeline in the background.
 *
 * Authentication: Bearer token via CRON_SECRET env var.
 * Schedule: Once daily, a few hours after auto-research (e.g., 9 AM).
 */
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Quick check: is there pending research?
  await dbConnect();
  const pending = await Research.findOne({ status: "pending" })
    .sort({ created_at: 1 })
    .select("_id topic")
    .lean();

  if (!pending) {
    return NextResponse.json(
      { message: "No pending research found. Run auto-research first." },
      { status: 200 }
    );
  }

  // Fire-and-forget: run the entire pipeline in the background
  runPipeline().catch((err) =>
    console.error("[GenerateFromResearch] Pipeline failed:", err)
  );

  // Respond immediately — cron sees success within ~2 seconds
  return NextResponse.json({
    success: true,
    message: "Blog generation started in background",
    researchId: pending._id,
    topic: pending.topic,
  });
}
