import { eq } from "drizzle-orm";
import { z } from "zod";
import { sessions, users } from "@/drizzle/schema";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import {
  createSessionToken,
  getSessionExpiryDate,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/session";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid login payload.",
          details: parsed.error.flatten(),
        },
        400
      );
    }

    const { email, password } = parsed.data;
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: {
        userId: true,
        email: true,
        lozinkaHash: true,
        korisnickoIme: true,
        role: true,
      },
    });

    if (!user) {
      return jsonError(
        {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        },
        401
      );
    }

    const isValid = await verifyPassword(password, user.lozinkaHash);
    if (!isValid) {
      return jsonError(
        {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        },
        401
      );
    }

    const sessionToken = createSessionToken();
    const expiresAt = getSessionExpiryDate();

    await db.insert(sessions).values({
      sessionToken,
      userId: user.userId,
      expiresAt,
    });

    const response = jsonSuccess({
      user: {
        userId: user.userId,
        email: user.email,
        korisnickoIme: user.korisnickoIme,
        role: user.role,
      },
    });
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, SESSION_COOKIE_OPTIONS);

    return response;
  } catch {
    return jsonError(
      {
        code: "INTERNAL_ERROR",
        message: "Unexpected server error.",
      },
      500
    );
  }
}
