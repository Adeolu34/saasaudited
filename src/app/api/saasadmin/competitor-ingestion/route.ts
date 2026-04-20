import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/auth/api-auth";
import dbConnect from "@/lib/mongodb";
import {
  getIngestionSummary,
  listIngestionQueue,
  upsertToolFromIngestion,
} from "@/lib/competitors/upsert";
import { COMPETITOR_SOURCES, type CompetitorSource } from "@/lib/competitors/types";

function parseSource(input: string | null): CompetitorSource | undefined {
  if (!input) return undefined;
  const candidate = input.trim() as CompetitorSource;
  return COMPETITOR_SOURCES.includes(candidate) ? candidate : undefined;
}

export async function GET(request: NextRequest) {
  const auth = await requireApiRole("editor");
  if (auth.error) return auth.error;

  await dbConnect();

  const { searchParams } = request.nextUrl;
  const summary = searchParams.get("summary") === "true";
  if (summary) {
    const data = await getIngestionSummary();
    return NextResponse.json(data);
  }

  const source = parseSource(searchParams.get("source"));
  const status = searchParams.get("status") as
    | "pending"
    | "needs_review"
    | "upserted"
    | "skipped"
    | "error"
    | null;
  const limitRaw = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(limitRaw) ? limitRaw : 100;

  const items = await listIngestionQueue({
    source,
    status: status ?? undefined,
    limit,
  });
  return NextResponse.json({ items, count: items.length });
}

/**
 * POST /api/saasadmin/competitor-ingestion
 * Body:
 * {
 *   "action": "upsert",
 *   "ingestionId": "<mongo id>"
 * }
 */
export async function POST(request: NextRequest) {
  const auth = await requireApiRole("admin");
  if (auth.error) return auth.error;

  await dbConnect();

  const body = (await request.json()) as {
    action?: "upsert";
    ingestionId?: string;
  };

  if (body.action !== "upsert" || !body.ingestionId) {
    return NextResponse.json(
      { error: "action=upsert and ingestionId are required" },
      { status: 400 }
    );
  }

  const result = await upsertToolFromIngestion(body.ingestionId);
  return NextResponse.json({ success: true, result });
}
