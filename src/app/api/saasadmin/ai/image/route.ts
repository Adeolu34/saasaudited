import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/ai/image";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { requireApiRole } from "@/lib/auth/api-auth";

export async function POST(request: NextRequest) {
  const { error: authError } = await requireApiRole("editor");
  if (authError) return authError;

  try {
    if (!checkRateLimit("ai-image")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a minute." },
        { status: 429 }
      );
    }

    const { title, contentType, context, variant } = await request.json();

    if (!title || !contentType) {
      return NextResponse.json(
        { error: "title and contentType are required" },
        { status: 400 }
      );
    }

    if (contentType !== "blog" && contentType !== "tool" && contentType !== "author") {
      return NextResponse.json(
        { error: "contentType must be 'blog', 'tool', or 'author'" },
        { status: 400 }
      );
    }

    if (variant && variant !== "featured" && variant !== "inline") {
      return NextResponse.json(
        { error: "variant must be 'featured' or 'inline'" },
        { status: 400 }
      );
    }

    const url = await generateImage({ title, contentType, context, variant });
    return NextResponse.json({ url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Image generation failed";
    console.error("[AI Image]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
