import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, DEFAULT_MODEL, DEFAULT_MAX_TOKENS } from "@/lib/ai/openai";
import { parseAIResponse } from "@/lib/ai/parsers";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
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

    const prompts = promptMap[type as ContentType];
    const systemPrompt = prompts.buildSystemPrompt();
    const userPrompt = prompts.buildUserPrompt(params);

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: DEFAULT_MAX_TOKENS,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      throw new Error("OpenAI returned empty response");
    }

    const data = parseAIResponse(rawContent);

    return NextResponse.json({
      data,
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens,
        completion_tokens: completion.usage?.completion_tokens,
        model: DEFAULT_MODEL,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Generation failed";
    console.error("[AI Generate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
