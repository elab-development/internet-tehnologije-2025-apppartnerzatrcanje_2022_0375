import { eq } from "drizzle-orm";
import { z } from "zod";
import { users } from "@/drizzle/schema";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  korisnickoIme: z.string().min(3).max(100),
  slikaKorisnika: z.string().url().optional().nullable(),
  starost: z.number().int().min(10).max(120),
  pol: z.string().min(1).max(20),
  nivoKondicije: z.string().min(1).max(20),
  tempoTrcanja: z.number().positive(),
  role: z.enum(["admin", "coach", "runner"]).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid register payload.",
          details: parsed.error.flatten(),
        },
        400
      );
    }

    const payload = parsed.data;
    const existing = await db.query.users.findFirst({
      where: eq(users.email, payload.email),
      columns: { userId: true },
    });

    if (existing) {
      return jsonError(
        {
          code: "EMAIL_TAKEN",
          message: "Email is already registered.",
        },
        409
      );
    }

    const lozinkaHash = await hashPassword(payload.password);

    const [createdUser] = await db
      .insert(users)
      .values({
        email: payload.email,
        lozinkaHash,
        korisnickoIme: payload.korisnickoIme,
        slikaKorisnika: payload.slikaKorisnika ?? null,
        starost: payload.starost,
        pol: payload.pol,
        nivoKondicije: payload.nivoKondicije,
        tempoTrcanja: payload.tempoTrcanja,
        role: payload.role ?? "runner",
      })
      .returning({
        userId: users.userId,
        email: users.email,
        korisnickoIme: users.korisnickoIme,
        role: users.role,
      });

    return jsonSuccess(createdUser, 201);
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
