import { cache } from "react";
import { redirect } from "next/navigation";
import { verifySession, type SessionPayload } from "./session";

const ROLE_HIERARCHY: Record<string, number> = {
  superadmin: 3,
  admin: 2,
  editor: 1,
};

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  return verifySession();
});

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/saasadmin/login");
  }
  return session;
}

export async function requireRole(
  minRole: "superadmin" | "admin" | "editor"
): Promise<SessionPayload> {
  const session = await requireAdmin();
  const userLevel = ROLE_HIERARCHY[session.role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;
  if (userLevel < requiredLevel) {
    redirect("/saasadmin?error=unauthorized");
  }
  return session;
}
