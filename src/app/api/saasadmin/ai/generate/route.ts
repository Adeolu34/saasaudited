import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getOpenAI } from "@/lib/ai/openai";
import { parseAIResponse } from "@/lib/ai/parsers";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { getGlobalSettings, getPromptOverrides, interpolateTemplate } from "@/lib/ai/settings";
import { searchSaaS, formatSearchResultsForPrompt } from "@/lib/ai/search";
import { generateImage } from "@/lib/ai/image";
import * as toolPrompts from "@/lib/ai/prompts/tool";
import * as reviewPrompts from "@/lib/ai/prompts/review";
import * as blogPrompts from "@/lib/ai/prompts/blog-post";
import * as comparisonPrompts from "@/lib/ai/prompts/comparison";
import * as categoryPrompts from "@/lib/ai/prompts/category";

const promptMap = {
  tool: toolPrompts,
  review: reviewPrompts,
  blog: blogPrompts,
  comparison: comparisonPrompts,
  category: categoryPrompts,
};

type ContentType = keyof typeof promptMap;

const IMAGE_TYPES = new Set(["blog", "tool"]);

export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit("ai-generate")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a minute." },
        { status: 429 }
      );
    }

    const { type, params } = await request.json();

    if (!type || !promptMap[type as ContentType]) {
      return NextResponse.json(
        { error: "Invalid type. Must be one of: tool, review, blog, comparison, category" },
        { status: 400 }
      );
    }

    await dbConnect();
    const settings = await getGlobalSettings();
    const overrides = await getPromptOverrides(type as ContentType);

    // Web search integration
    if (settings.search_enabled) {
      const searchQuery =
        params.topic || params.toolName || params.toolAName || params.categoryName || "";
      if (searchQuery) {
        const search = await searchSaaS(searchQuery + " SaaS " + new Date().getFullYear());
        const context = formatSearchResultsForPrompt(search);
        if (context) {
          params.searchResults = context;
        }
      }
    }

    // Add year to params
    params.year = String(new Date().getFullYear());

    // Split comma-separated keywords into array for blog prompts
    if (type === "blog" && params.keywords && typeof params.keywords === "string") {
      params.keywords = params.keywords.split(",").map((k: string) => k.trim()).filter(Boolean);
    }

    // Resolve prompts: DB override or hardcoded default
    const hardcodedPrompts = promptMap[type as ContentType];
    let systemPrompt: string;
    let userPrompt: string;

    if (overrides?.systemPrompt) {
      systemPrompt = overrides.systemPrompt;
    } else {
      systemPrompt = hardcodedPrompts.buildSystemPrompt();
    }

    if (overrides?.userPromptTemplate) {
      userPrompt = interpolateTemplate(overrides.userPromptTemplate, params);
    } else {
      userPrompt = hardcodedPrompts.buildUserPrompt(params);
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

    const data = parseAIResponse<Record<string, unknown>>(rawContent);

    // Auto-generate image if enabled
    let imageGenerated = false;
    if (settings.auto_generate_images && IMAGE_TYPES.has(type)) {
      try {
        const title = (data.title || data.name || params.topic || params.toolName) as string;
        if (title) {
          const imageUrl = await generateImage({
            title,
            contentType: type as "blog" | "tool",
          });
          data.featured_image = imageUrl;
          if (type === "tool") data.logo_url = imageUrl;
          imageGenerated = true;
        }
      } catch (imgErr) {
        console.error("[AI Generate] Image generation failed:", imgErr);
      }
    }

    return NextResponse.json({
      data,
      imageGenerated,
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens,
        completion_tokens: completion.usage?.completion_tokens,
        model: settings.model,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Generation failed";
    console.error("[AI Generate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
