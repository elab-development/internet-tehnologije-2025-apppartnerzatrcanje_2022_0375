import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { sessions, users } from "@/drizzle/schema";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { db } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return jsonError(
      {
        code: "UNAUTHORIZED",
        message: "Not authenticated.",
      },
      401
    );
  }

  const now = new Date();
  const activeSession = await db.query.sessions.findFirst({
    where: and(eq(sessions.sessionToken, sessionToken), gt(sessions.expiresAt, now)),
    columns: { userId: true },
  });

  if (!activeSession) {
    return jsonError(
      {
        code: "UNAUTHORIZED",
        message: "Session expired or invalid.",
      },
      401
    );
  }

  const user = await db.query.users.findFirst({
    where: eq(users.userId, activeSession.userId),
    columns: {
      userId: true,
      email: true,
      korisnickoIme: true,
      role: true,
      starost: true,
      pol: true,
      nivoKondicije: true,
      tempoTrcanja: true,
      slikaKorisnika: true,
    },
  });

  if (!user) {
    return jsonError(
      {
        code: "UNAUTHORIZED",
        message: "User not found for session.",
      },
      401
    );
  }

  return jsonSuccess({ user });
}
