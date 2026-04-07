import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AiSettings from "@/lib/models/AiSettings";
import { clearSettingsCache } from "@/lib/ai/settings";

const VALID_KEYS = new Set(["global", "blog", "tool", "review", "comparison", "category"]);

export async function GET() {
  try {
    await dbConnect();
    const settings = await AiSettings.find().lean();
    return NextResponse.json({ settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { config_key, ...fields } = body;

    if (!config_key || !VALID_KEYS.has(config_key)) {
      return NextResponse.json(
        { error: "Invalid config_key. Must be one of: global, blog, tool, review, comparison, category" },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (fields.temperature !== undefined) {
      const temp = Number(fields.temperature);
      if (isNaN(temp) || temp < 0 || temp > 2) {
        return NextResponse.json(
          { error: "Temperature must be between 0 and 2" },
          { status: 400 }
        );
      }
      fields.temperature = temp;
    }

    if (fields.max_tokens !== undefined) {
      const tokens = Number(fields.max_tokens);
      if (isNaN(tokens) || tokens < 256 || tokens > 16384) {
        return NextResponse.json(
          { error: "Max tokens must be between 256 and 16384" },
          { status: 400 }
        );
      }
      fields.max_tokens = tokens;
    }

    await dbConnect();
    const settings = await AiSettings.findOneAndUpdate(
      { config_key },
      { $set: { config_key, ...fields } },
      { upsert: true, new: true, runValidators: true }
    );

    // Clear cached settings so changes take effect immediately
    clearSettingsCache();

    return NextResponse.json({ settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
