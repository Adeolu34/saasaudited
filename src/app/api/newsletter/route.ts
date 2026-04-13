import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import NewsletterSubscriber from "@/lib/models/NewsletterSubscriber";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_MAP_MAX = 10_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    // Prevent unbounded map growth — evict expired entries periodically
    if (rateLimit.size > RATE_LIMIT_MAP_MAX) {
      for (const [key, val] of rateLimit) {
        if (now > val.resetAt) rateLimit.delete(key);
      }
    }
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const email = body?.email;

    if (
      typeof email !== "string" ||
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    await dbConnect();

    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      if (!existing.is_active) {
        existing.is_active = true;
        await existing.save();
      }
      // Uniform response to prevent email enumeration
      return NextResponse.json(
        { message: "Thanks for subscribing! Check your inbox." },
        { status: 200 }
      );
    }

    await NewsletterSubscriber.create({
      email,
      source: "website",
    });

    return NextResponse.json(
      { message: "Thanks for subscribing! Check your inbox." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
