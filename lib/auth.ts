import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessions, users } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export type AuthUser = {
  userId: number;
  email: string;
  korisnickoIme: string;
  role: string;
};

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const activeSession = await db.query.sessions.findFirst({
    where: and(eq(sessions.sessionToken, sessionToken), gt(sessions.expiresAt, new Date())),
    columns: { userId: true },
  });

  if (!activeSession) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.userId, activeSession.userId),
    columns: {
      userId: true,
      email: true,
      korisnickoIme: true,
      role: true,
    },
  });

  return user ?? null;
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin") {
    redirect("/main");
  }
  return user;
}
