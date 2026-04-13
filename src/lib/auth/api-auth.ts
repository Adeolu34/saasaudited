import { verifySession, type SessionPayload } from "./session";
import { NextResponse } from "next/server";

type Role = "superadmin" | "admin" | "editor";

const ROLE_HIERARCHY: Record<Role, number> = {
  superadmin: 3,
  admin: 2,
  editor: 1,
};

type AuthSuccess = { session: SessionPayload; error: null };
type AuthFailure = { session: null; error: NextResponse };

/**
 * Verify session and enforce minimum role for API routes.
 * Returns { session, error } — caller checks error and returns it if non-null.
 */
export async function requireApiRole(
  minRole: Role
): Promise<AuthSuccess | AuthFailure> {
  const session = await verifySession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const userLevel = ROLE_HIERARCHY[session.role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;
  if (userLevel < requiredLevel) {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { session, error: null };
}
