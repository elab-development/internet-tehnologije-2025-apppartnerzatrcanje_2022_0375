import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { sessions } from "@/drizzle/schema";
import { jsonSuccess } from "@/lib/api/response";
import { db } from "@/lib/db";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/session";

export async function POST() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
  }

  const response = jsonSuccess({ loggedOut: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  });

  return response;
}
