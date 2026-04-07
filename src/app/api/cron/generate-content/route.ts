import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/lib/models/BlogPost";
import { getOpenAI } from "@/lib/ai/openai";
import { generateImage } from "@/lib/ai/image";
import { parseAIResponse } from "@/lib/ai/parsers";
import { getGlobalSettings, getPromptOverrides, interpolateTemplate } from "@/lib/ai/settings";
import { discoverTrendingSaaS, formatSearchResultsForPrompt } from "@/lib/ai/search";
import * as blogPrompts from "@/lib/ai/prompts/blog-post";

const DEFAULT_TOPIC_POOL = [
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
    const settings = await getGlobalSettings();

    // Resolve topic pool
    const year = new Date().getFullYear();
    const topicPool =
      settings.topic_pool.length > 0 ? settings.topic_pool : DEFAULT_TOPIC_POOL;
    const topic = topicPool[Math.floor(Math.random() * topicPool.length)].replace(
      "{year}",
      String(year)
    );

    // Web search for real SaaS data
    let searchContext = "";
    if (settings.search_enabled) {
      try {
        const research = await discoverTrendingSaaS();
        searchContext = formatSearchResultsForPrompt(research);
      } catch (searchErr) {
        console.error("[Cron] Search failed, continuing without research:", searchErr);
      }
    }

    // Resolve prompts
    const overrides = await getPromptOverrides("blog");
    let systemPrompt: string;
    let userPrompt: string;

    if (overrides?.systemPrompt) {
      systemPrompt = overrides.systemPrompt;
    } else {
      systemPrompt = blogPrompts.buildSystemPrompt();
    }

    if (overrides?.userPromptTemplate) {
      userPrompt = interpolateTemplate(overrides.userPromptTemplate, {
        topic,
        year: String(year),
        searchResults: searchContext,
      });
    } else {
      userPrompt = blogPrompts.buildUserPrompt({
        topic,
        year: String(year),
        searchResults: searchContext || undefined,
      });
    }

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

    // Generate featured image
    if (settings.auto_generate_images) {
      try {
        const imageUrl = await generateImage({
          title: blogData.title as string,
          contentType: "blog",
        });
        blogData.featured_image = imageUrl;
      } catch (imgErr) {
        console.error("[Cron] Image generation failed, publishing without image:", imgErr);
      }
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

    // Auto-calculate read_time from content word count
    if (blogData.content) {
      const words = (blogData.content as string).replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
      blogData.read_time = Math.max(1, Math.ceil(words / 230));
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
