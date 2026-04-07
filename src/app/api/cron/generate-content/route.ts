import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/lib/models/BlogPost";
import { getOpenAI, DEFAULT_MODEL, DEFAULT_MAX_TOKENS } from "@/lib/ai/openai";
import { generateImage } from "@/lib/ai/image";
import { parseAIResponse } from "@/lib/ai/parsers";
import * as blogPrompts from "@/lib/ai/prompts/blog-post";

const TOPIC_POOL = [
  "Best practices for evaluating SaaS tools in {year}",
  "How to reduce SaaS spend without sacrificing productivity",
  "Top emerging SaaS categories to watch in {year}",
  "SaaS security checklist for B2B buyers",
  "How to build an effective SaaS stack for startups",
  "The hidden costs of free SaaS tools",
  "When to switch SaaS providers: signs it is time to move on",
  "How AI is transforming B2B software in {year}",
  "Remote team collaboration tools: what actually works",
  "SaaS onboarding mistakes that kill adoption rates",
  "How to run a proper SaaS vendor evaluation",
  "The rise of vertical SaaS: industry-specific tools worth watching",
  "Data migration between SaaS platforms: a practical guide",
  "Why SaaS pricing is getting more complex and what to do about it",
  "Building a SaaS procurement process from scratch",
  "API integrations: the hidden differentiator in SaaS selection",
  "SaaS compliance and data residency: what buyers need to know",
  "The case for consolidating your SaaS stack",
  "How to measure ROI on your SaaS investments",
  "Project management tools compared: what the data actually shows",
];

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const year = new Date().getFullYear();
    const topic = TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)].replace(
      "{year}",
      String(year)
    );

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: blogPrompts.buildSystemPrompt() },
        { role: "user", content: blogPrompts.buildUserPrompt({ topic }) },
      ],
      max_tokens: DEFAULT_MAX_TOKENS,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      throw new Error("OpenAI returned empty response");
    }

    const blogData = parseAIResponse<Record<string, unknown>>(rawContent);

    // Try generating a featured image (non-blocking failure)
    try {
      const imageUrl = await generateImage({
        title: blogData.title as string,
        contentType: "blog",
      });
      blogData.featured_image = imageUrl;
    } catch (imgErr) {
      console.error("[Cron] Image generation failed, publishing without image:", imgErr);
    }

    blogData.published_at = new Date();

    // Ensure slug uniqueness
    const existingSlug = await BlogPost.findOne({ slug: blogData.slug });
    if (existingSlug) {
      blogData.slug = `${blogData.slug}-${Date.now()}`;
    }

    const post = await BlogPost.create(blogData);

    console.log(`[Cron] Published: "${post.title}" (${post.slug})`);

    return NextResponse.json({
      success: true,
      postId: post._id,
      title: post.title,
      slug: post.slug,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Cron generation failed";
    console.error("[Cron]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
