import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import ApiKey from "@/lib/models/ApiKey";
import { requireApiRole } from "@/lib/auth/api-auth";

export async function GET() {
  const { error } = await requireApiRole("admin");
  if (error) return error;

  await dbConnect();
  const keys = await ApiKey.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ keys });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireApiRole("admin");
  if (error) return error;

  try {
    await dbConnect();
    const body = await request.json();
    const { name, scopes, rate_limit, expires_at } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate a secure API key
    const rawKey = `sv_live_${crypto.randomBytes(24).toString("hex")}`;
    const key_prefix = rawKey.substring(0, 16) + "...";
    const key_hash = crypto.createHash("sha256").update(rawKey).digest("hex");

    const apiKey = await ApiKey.create({
      name,
      key_prefix,
      key_hash,
      scopes: scopes || [],
      rate_limit: rate_limit || 60,
      expires_at: expires_at || undefined,
      created_by: session.userId,
    });

    // Return the full key only once
    return NextResponse.json(
      { key: { ...apiKey.toObject(), full_key: rawKey } },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create key";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
