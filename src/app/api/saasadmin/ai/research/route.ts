import { NextRequest, NextResponse } from "next/server";
import { searchSaaS } from "@/lib/ai/search";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { requireApiRole } from "@/lib/auth/api-auth";

export async function POST(request: NextRequest) {
  const { error: authError } = await requireApiRole("editor");
  if (authError) return authError;

  try {
    if (!checkRateLimit("ai-research")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a minute." },
        { status: 429 }
      );
    }

    if (!process.env.SERPER_API_KEY) {
      return NextResponse.json(
        { error: "SERPER_API_KEY not configured. Add it in Coolify environment variables." },
        { status: 400 }
      );
    }

    const { query } = await request.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const results = await searchSaaS(query);
    return NextResponse.json(results);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Research failed";
    console.error("[Research]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
