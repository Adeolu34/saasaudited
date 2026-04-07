import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page through
  if (pathname === "/saasadmin/login") {
    return NextResponse.next();
  }

  // Check session cookie
  const token = request.cookies.get("admin_session")?.value;
  if (!token) {
    // API routes return 401, pages redirect
    if (pathname.startsWith("/api/saasadmin")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/saasadmin/login", request.url));
  }

  const secret = getSecret();
  if (!secret) {
    if (pathname.startsWith("/api/saasadmin")) {
      return Response.json({ error: "Server misconfigured" }, { status: 500 });
    }
    return NextResponse.redirect(new URL("/saasadmin/login", request.url));
  }

  try {
    await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/api/saasadmin")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/saasadmin/login", request.url));
  }
}

export const config = {
  matcher: ["/saasadmin/:path*", "/api/saasadmin/:path*"],
};
