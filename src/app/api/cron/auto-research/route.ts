import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Research from "@/lib/models/Research";
import { getOpenAI } from "@/lib/ai/openai";
import { parseAIResponse } from "@/lib/ai/parsers";
import { getGlobalSettings } from "@/lib/ai/settings";
import { discoverTrendingSaaS, deepResearch, formatDeepResearchForPrompt } from "@/lib/ai/search";

export const maxDuration = 300;

/**
 * The actual heavy work — runs in the background after the HTTP response is sent.
 * Safe on self-hosted Node.js (Coolify) where the process stays alive.
 */
async function runResearchPipeline() {
  await dbConnect();
  const settings = await getGlobalSettings();
  const year = new Date().getFullYear();

  // Step 1: Discover what's trending in SaaS right now
  console.log("[AutoResearch] Discovering trending SaaS topics...");
  const discovery = await discoverTrendingSaaS();

  if (!discovery.results.length) {
    console.error("[AutoResearch] Discovery search returned no results. Check SERPER_API_KEY.");
    return;
  }

  // Step 2: Use OpenAI to pick the best blog topic and generate keywords
  const openai = getOpenAI();

  const topicPickerResult = await openai.chat.completions.create({
    model: settings.model,
    messages: [
      {
        role: "system",
        content: `You are a B2B SaaS content strategist and SEO specialist for SaasAudited. Given search results about trending SaaS topics, pick the single most compelling blog topic that would attract B2B buyers and decision-makers.

Generate thorough keyword research for the chosen topic. Think about:
- What would a buyer actually search for?
- What long-tail keywords have purchase intent?
- What related terms should the article rank for?

Respond with ONLY valid JSON:
{
  "topic": "the chosen blog topic title",
  "angle": "a specific angle, hook, or unique perspective for the article",
  "category": "one of: Strategy, Reviews, Comparisons, Guides, Industry News",
  "keywords": ["primary keyword (highest search intent)", "secondary keyword 1", "secondary keyword 2", "secondary keyword 3", "long-tail keyword 1", "long-tail keyword 2"]
}

The primary keyword (first in the array) should be the term with the highest search volume and buyer intent. Include 5-8 total keywords mixing head terms and long-tail phrases.`,
      },
      {
        role: "user",
        content: `Current year: ${year}. Pick the best blog topic from these trending results:\n\n${discovery.results
          .map((r, i) => `${i + 1}. "${r.title}" — ${r.snippet}`)
          .join("\n")}\n\nChoose a topic that is timely, has search demand, and offers a unique angle for B2B SaaS buyers.`,
      },
    ],
    max_tokens: 500,
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const topicRaw = topicPickerResult.choices[0]?.message?.content;
  if (!topicRaw) {
    throw new Error("Topic picker returned empty response");
  }

  const topicData = parseAIResponse<{
    topic: string;
    angle: string;
    category: string;
    keywords: string[];
  }>(topicRaw);

  console.log(`[AutoResearch] Selected topic: "${topicData.topic}"`);
  console.log(`[AutoResearch] Angle: "${topicData.angle}"`);
  console.log(`[AutoResearch] Keywords: ${topicData.keywords.join(", ")}`);

  // Step 3: Deep research on the chosen topic (3 parallel searches)
  console.log("[AutoResearch] Running deep research...");
  const research = await deepResearch(topicData.topic);
  const searchContext = formatDeepResearchForPrompt(research);

  // Step 4: Save to Research collection for later blog generation
  const researchDoc = await Research.create({
    topic: topicData.topic,
    keywords: topicData.keywords || [],
    search_data: searchContext,
    suggested_angle: topicData.angle,
    suggested_category: topicData.category || "Strategy",
    status: "pending",
  });

  console.log(`[AutoResearch] Research saved: "${researchDoc.topic}" (${researchDoc._id})`);
}

/**
 * POST /api/cron/auto-research
 *
 * Step 1 of the two-step blog pipeline.
 * Returns immediately (within ~2s) and runs research in the background.
 *
 * Authentication: Bearer token via CRON_SECRET env var.
 * Schedule: Once daily (e.g., 6 AM).
 */
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fire-and-forget: run the entire pipeline in the background
  runResearchPipeline().catch((err) =>
    console.error("[AutoResearch] Pipeline failed:", err)
  );

  // Respond immediately — cron sees success within ~2 seconds
  return NextResponse.json({
    success: true,
    message: "Research pipeline started in background",
  });
}
