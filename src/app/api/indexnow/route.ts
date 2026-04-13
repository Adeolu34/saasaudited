import { NextResponse } from "next/server";

/**
 * GET /api/indexnow
 *
 * Serves the IndexNow API key verification file.
 * IndexNow requires a file at /{key}.txt containing the key.
 * We handle this via a route instead for simpler deployment.
 *
 * The key is served both at /api/indexnow and is referenced
 * in the keyLocation field of IndexNow submissions.
 */
export async function GET() {
  const apiKey = process.env.INDEXNOW_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "INDEXNOW_API_KEY not configured" }, { status: 500 });
  }

  return new NextResponse(apiKey, {
    headers: { "Content-Type": "text/plain" },
  });
}
