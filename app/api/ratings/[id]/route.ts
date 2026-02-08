import { eq } from "drizzle-orm";
import { z } from "zod";
import { ratings } from "@/drizzle/schema";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateRatingSchema = z.object({
  score: z.coerce.number().int().min(1, "Ocena mora biti od 1 do 5.").max(5, "Ocena mora biti od 1 do 5."),
  comment: z
    .string()
    .trim()
    .min(1, "Komentar je obavezan.")
    .max(1000, "Komentar moze imati najvise 1000 karaktera."),
});

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return jsonError({ code: "UNAUTHORIZED", message: "Not authenticated." }, 401);
    }

    const { id } = await context.params;
    const ratingId = Number(id);
    if (!Number.isInteger(ratingId) || ratingId <= 0) {
      return jsonError({ code: "VALIDATION_ERROR", message: "Neispravan ID ocene." }, 400);
    }

    const existing = await db.query.ratings.findFirst({
      where: eq(ratings.ratingId, ratingId),
      columns: { ratingId: true, fromUserId: true },
    });

    if (!existing) {
      return jsonError({ code: "NOT_FOUND", message: "Ocena nije pronadjena." }, 404);
    }

    const canEdit = existing.fromUserId === authUser.userId || authUser.role === "admin";
    if (!canEdit) {
      return jsonError({ code: "FORBIDDEN", message: "Nemas dozvolu da menjas ovu ocenu." }, 403);
    }

    const body = await request.json();
    const parsed = updateRatingSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        {
          code: "VALIDATION_ERROR",
          message: "Podaci za izmenu ocene nisu ispravni.",
          details: parsed.error.flatten(),
        },
        400
      );
    }

    const [updated] = await db
      .update(ratings)
      .set({
        score: parsed.data.score,
        comment: parsed.data.comment,
      })
      .where(eq(ratings.ratingId, ratingId))
      .returning({
        ratingId: ratings.ratingId,
        runId: ratings.runId,
        score: ratings.score,
        comment: ratings.comment,
        fromUserId: ratings.fromUserId,
        toUserId: ratings.toUserId,
      });

    return jsonSuccess({ rating: updated });
  } catch {
    return jsonError({ code: "INTERNAL_ERROR", message: "Doslo je do neocekivane greske na serveru." }, 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return jsonError({ code: "UNAUTHORIZED", message: "Not authenticated." }, 401);
    }

    const { id } = await context.params;
    const ratingId = Number(id);
    if (!Number.isInteger(ratingId) || ratingId <= 0) {
      return jsonError({ code: "VALIDATION_ERROR", message: "Neispravan ID ocene." }, 400);
    }

    const existing = await db.query.ratings.findFirst({
      where: eq(ratings.ratingId, ratingId),
      columns: { ratingId: true, fromUserId: true },
    });

    if (!existing) {
      return jsonError({ code: "NOT_FOUND", message: "Ocena nije pronadjena." }, 404);
    }

    const canDelete = existing.fromUserId === authUser.userId || authUser.role === "admin";
    if (!canDelete) {
      return jsonError({ code: "FORBIDDEN", message: "Nemas dozvolu da obrises ovu ocenu." }, 403);
    }

    await db.delete(ratings).where(eq(ratings.ratingId, ratingId));
    return jsonSuccess({ deleted: true });
  } catch {
    return jsonError({ code: "INTERNAL_ERROR", message: "Doslo je do neocekivane greske na serveru." }, 500);
  }
}
