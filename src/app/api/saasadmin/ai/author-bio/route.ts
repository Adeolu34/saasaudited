import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/ai/openai";
import { getGlobalSettings } from "@/lib/ai/settings";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { requireApiRole } from "@/lib/auth/api-auth";

export async function POST(request: NextRequest) {
  const { error: authError } = await requireApiRole("editor");
  if (authError) return authError;

  try {
    if (!checkRateLimit("ai-author-bio")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a minute." },
        { status: 429 }
      );
    }

    const { name, role } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const settings = await getGlobalSettings();
    const openai = getOpenAI();

    const completion = await openai.chat.completions.create({
      model: settings.model,
      messages: [
        {
          role: "system",
          content: `You are a professional copywriter for SaasAudited, a B2B SaaS review publication. Generate a compelling, concise author bio (2-3 sentences, ~40-60 words). The bio should:
- Sound authoritative and credible
- Mention relevant expertise areas related to SaaS/technology
- Include a plausible professional background (former roles, specializations)
- Be written in third person
- NOT use generic phrases like "passionate about" or "dedicated to"

Respond with ONLY valid JSON: { "bio": "the bio text", "role": "suggested role title if none provided" }`,
        },
        {
          role: "user",
          content: `Generate a professional bio for: ${name}${role ? `, whose role is ${role}` : ""}. They write for SaasAudited, a publication that provides data-driven SaaS reviews and analysis.`,
        },
      ],
      max_tokens: 200,
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("OpenAI returned empty response");

    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bio generation failed";
    console.error("[AI Author Bio]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
