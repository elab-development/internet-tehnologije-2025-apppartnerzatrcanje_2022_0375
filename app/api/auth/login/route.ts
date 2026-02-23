import { eq } from "drizzle-orm";
import { z } from "zod";
import { sessions, users } from "@/drizzle/schema";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { verifyCaptchaToken } from "@/lib/security/captcha";
import { rateLimit } from "@/lib/security/rate-limit";
import {
  createSessionToken,
  getSessionExpiryDate,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/session";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  captchaToken: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const limit = rateLimit(request, "auth-login", {
      windowMs: 60_000,
      max: 10,
    });
    if (!limit.ok) {
      return jsonError(
        {
          code: "RATE_LIMITED",
          message: "Too many login attempts. Try again soon.",
        },
        429
      );
    }

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

    const { email, password, captchaToken } = parsed.data;
    const captcha = await verifyCaptchaToken(captchaToken);
    if (!captcha.ok) {
      return jsonError(
        {
          code: "CAPTCHA_FAILED",
          message: "Captcha verification failed.",
        },
        400
      );
    }

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
