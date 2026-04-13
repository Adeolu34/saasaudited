import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import AdminUser from "@/lib/models/AdminUser";
import { createSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/ai/rate-limiter";

// Pre-computed dummy hash so bcrypt.compare always runs (prevents timing attacks)
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`login:${ip}`)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await AdminUser.findOne({ email, is_active: true });

    // Always run bcrypt.compare to prevent timing-based user enumeration
    const valid = await bcrypt.compare(
      password,
      user?.password_hash || DUMMY_HASH
    );

    if (!user || !valid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    await AdminUser.updateOne(
      { _id: user._id },
      { last_login_at: new Date() }
    );

    await createSession({
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
