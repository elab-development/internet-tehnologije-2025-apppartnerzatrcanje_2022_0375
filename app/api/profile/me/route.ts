import { and, eq, gt, ne } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";
import { sessions, users } from "@/drizzle/schema";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { db } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/session";

const profilePatchSchema = z.object({
  korisnickoIme: z.string().trim().min(3).max(100),
  slikaKorisnika: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }
      const trimmed = value.trim();
      return trimmed.length === 0 ? null : trimmed;
    },
    z.string().url().nullable().optional()
  ),
  starost: z.coerce.number().int().min(10).max(120),
  pol: z.enum(["muski", "zenski", "drugo"]),
  nivoKondicije: z.enum(["pocetni", "srednji", "napredni"]),
  tempoTrcanja: z.coerce.number().positive(),
});

async function getUserIdFromSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return null;
  }

  const now = new Date();
  const activeSession = await db.query.sessions.findFirst({
    where: and(eq(sessions.sessionToken, sessionToken), gt(sessions.expiresAt, now)),
    columns: { userId: true },
  });

  return activeSession?.userId ?? null;
}

export async function GET() {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return jsonError(
        {
          code: "UNAUTHORIZED",
          message: "Not authenticated.",
        },
        401
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.userId, userId),
      columns: {
        userId: true,
        email: true,
        korisnickoIme: true,
        slikaKorisnika: true,
        starost: true,
        pol: true,
        nivoKondicije: true,
        tempoTrcanja: true,
        role: true,
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

export async function PATCH(request: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return jsonError(
        {
          code: "UNAUTHORIZED",
          message: "Not authenticated.",
        },
        401
      );
    }

    const body = await request.json();
    const parsed = profilePatchSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        {
          code: "VALIDATION_ERROR",
          message: "Neispravan unos profila.",
          details: parsed.error.flatten(),
        },
        400
      );
    }

    const payload = parsed.data;
    const usernameTaken = await db.query.users.findFirst({
      where: and(eq(users.korisnickoIme, payload.korisnickoIme), ne(users.userId, userId)),
      columns: { userId: true },
    });

    if (usernameTaken) {
      return jsonError(
        {
          code: "USERNAME_TAKEN",
          message: "Korisnicko ime je zauzeto.",
        },
        409
      );
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        korisnickoIme: payload.korisnickoIme,
        slikaKorisnika: payload.slikaKorisnika ?? null,
        starost: payload.starost,
        pol: payload.pol,
        nivoKondicije: payload.nivoKondicije,
        tempoTrcanja: payload.tempoTrcanja,
        updatedAt: new Date(),
      })
      .where(eq(users.userId, userId))
      .returning({
        userId: users.userId,
        email: users.email,
        korisnickoIme: users.korisnickoIme,
        slikaKorisnika: users.slikaKorisnika,
        starost: users.starost,
        pol: users.pol,
        nivoKondicije: users.nivoKondicije,
        tempoTrcanja: users.tempoTrcanja,
        role: users.role,
      });

    if (!updatedUser) {
      return jsonError(
        {
          code: "NOT_FOUND",
          message: "Korisnik nije pronadjen.",
        },
        404
      );
    }

    return jsonSuccess({ user: updatedUser });
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
