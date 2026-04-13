import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/auth/cron-auth";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/lib/models/BlogPost";
import { getOpenAI } from "@/lib/ai/openai";
import { generateImage } from "@/lib/ai/image";
import { parseAIResponse } from "@/lib/ai/parsers";
import { getGlobalSettings, getPromptOverrides, interpolateTemplate } from "@/lib/ai/settings";
import { deepResearch, formatDeepResearchForPrompt, discoverTrendingSaaS, formatSearchResultsForPrompt } from "@/lib/ai/search";
import * as blogPrompts from "@/lib/ai/prompts/blog-post";
import { getAuthorForType } from "@/lib/ai/authors";
import { buildBlogImageContext, insertInlineImageIntoBlogContent } from "@/lib/ai/blog-images";

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
  const authError = verifyCronAuth(request.headers.get("authorization"));
  if (authError) return authError;

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

    // Deep research for richer content context
    let searchContext = "";
    if (settings.search_enabled) {
      try {
        const research = await deepResearch(topic);
        searchContext = formatDeepResearchForPrompt(research);
      } catch (searchErr) {
        console.error("[Cron] Deep research failed, trying basic search:", searchErr);
        try {
          const basic = await discoverTrendingSaaS();
          searchContext = formatSearchResultsForPrompt(basic);
        } catch {
          console.error("[Cron] Basic search also failed, continuing without research");
        }
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

    const author = await getAuthorForType("blog");

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
        author,
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

    // Sanitize: AI sometimes returns {} instead of "" for image fields
    if (blogData.featured_image && typeof blogData.featured_image !== "string") {
      blogData.featured_image = "";
    }

    // Generate featured image
    if (settings.auto_generate_images) {
      try {
        const title = blogData.title as string;
        const imageUrl = await generateImage({
          title,
          contentType: "blog",
          variant: "featured",
          context: buildBlogImageContext({
            title,
            category: typeof blogData.category === "string" ? blogData.category : undefined,
            excerpt: typeof blogData.excerpt === "string" ? blogData.excerpt : undefined,
            content: typeof blogData.content === "string" ? blogData.content : undefined,
            tags: Array.isArray(blogData.tags)
              ? blogData.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 6)
              : undefined,
          }),
        });
        blogData.featured_image = imageUrl;

        // Add a second inline image inside the post body.
        if (typeof blogData.content === "string" && blogData.content.trim()) {
          const inlineImageUrl = await generateImage({
            title: `${title} (inline)`,
            contentType: "blog",
            variant: "inline",
            context: buildBlogImageContext({
              title,
              category: typeof blogData.category === "string" ? blogData.category : undefined,
              excerpt: typeof blogData.excerpt === "string" ? blogData.excerpt : undefined,
              content: blogData.content,
              tags: Array.isArray(blogData.tags)
                ? blogData.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 6)
                : undefined,
            }),
          });
          blogData.content = insertInlineImageIntoBlogContent(
            blogData.content,
            inlineImageUrl,
            `Illustration for ${title}`
          );
        }
      } catch (imgErr) {
        console.error("[Cron] Image generation failed, saving draft without image:", imgErr);
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

    // Save as DRAFT — requires manual review before publishing
    blogData.status = "draft";

    // Ensure slug uniqueness
    const existingSlug = await BlogPost.findOne({ slug: blogData.slug });
    if (existingSlug) {
      blogData.slug = `${blogData.slug}-${Date.now()}`;
    }

    const post = await BlogPost.create(blogData);

    console.log(`[Cron] Draft saved: "${post.title}" (${post.slug})`);

    return NextResponse.json({
      success: true,
      postId: post._id,
      title: post.title,
      slug: post.slug,
      status: "draft",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Cron generation failed";
    console.error("[Cron]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
