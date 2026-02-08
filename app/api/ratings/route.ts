import { and, eq } from "drizzle-orm";
import { ratings, runUsers, runs } from "@/drizzle/schema";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createRatingSchema } from "@/lib/validation/ratings";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return jsonError({ code: "UNAUTHORIZED", message: "Not authenticated." }, 401);
    }

    const body = await request.json();
    const parsed = createRatingSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        {
          code: "VALIDATION_ERROR",
          message: "Podaci za ocenu nisu ispravni.",
          details: parsed.error.flatten(),
        },
        400
      );
    }

    const run = await db.query.runs.findFirst({
      where: eq(runs.runId, parsed.data.runId),
      columns: { runId: true, hostUserId: true },
    });

    if (!run) {
      return jsonError({ code: "NOT_FOUND", message: "Trening nije pronadjen." }, 404);
    }

    if (run.hostUserId === authUser.userId) {
      return jsonError({ code: "VALIDATION_ERROR", message: "Ne mozes oceniti sebe kao kreatora." }, 400);
    }

    const membership = await db.query.runUsers.findFirst({
      where: and(eq(runUsers.runId, run.runId), eq(runUsers.userId, authUser.userId)),
      columns: { runUserId: true },
    });

    if (!membership) {
      return jsonError({ code: "FORBIDDEN", message: "Samo ucesnici treninga mogu oceniti kreatora." }, 403);
    }

    const existingRating = await db.query.ratings.findFirst({
      where: and(eq(ratings.runId, run.runId), eq(ratings.fromUserId, authUser.userId)),
      columns: { ratingId: true },
    });

    if (existingRating) {
      return jsonError({ code: "CONFLICT", message: "Vec si ocenio kreatora za ovaj trening." }, 409);
    }

    const [created] = await db
      .insert(ratings)
      .values({
        runId: run.runId,
        fromUserId: authUser.userId,
        toUserId: run.hostUserId,
        score: parsed.data.score,
        comment: parsed.data.comment,
      })
      .returning({
        ratingId: ratings.ratingId,
        runId: ratings.runId,
        score: ratings.score,
        comment: ratings.comment,
        fromUserId: ratings.fromUserId,
        toUserId: ratings.toUserId,
      });

    return jsonSuccess({ rating: created }, 201);
  } catch {
    return jsonError({ code: "INTERNAL_ERROR", message: "Doslo je do neocekivane greske na serveru." }, 500);
  }
}
