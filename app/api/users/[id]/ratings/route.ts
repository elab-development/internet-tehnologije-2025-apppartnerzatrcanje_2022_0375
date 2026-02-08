import { eq } from "drizzle-orm";
import { ratings, runs, users } from "@/drizzle/schema";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return jsonError({ code: "UNAUTHORIZED", message: "Not authenticated." }, 401);
    }

    const { id } = await context.params;
    const userId = Number(id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return jsonError({ code: "VALIDATION_ERROR", message: "Neispravan ID korisnika." }, 400);
    }

    const userExists = await db.query.users.findFirst({
      where: eq(users.userId, userId),
      columns: { userId: true },
    });

    if (!userExists) {
      return jsonError({ code: "NOT_FOUND", message: "Korisnik nije pronadjen." }, 404);
    }

    const rows = await db
      .select({
        ratingId: ratings.ratingId,
        runId: ratings.runId,
        runTitle: runs.title,
        score: ratings.score,
        comment: ratings.comment,
        fromUserId: ratings.fromUserId,
        fromUsername: users.korisnickoIme,
      })
      .from(ratings)
      .innerJoin(runs, eq(ratings.runId, runs.runId))
      .innerJoin(users, eq(ratings.fromUserId, users.userId))
      .where(eq(ratings.toUserId, userId));

    const averageScore =
      rows.length > 0 ? Number((rows.reduce((sum, row) => sum + row.score, 0) / rows.length).toFixed(2)) : null;

    return jsonSuccess({
      toUserId: userId,
      averageScore,
      totalRatings: rows.length,
      ratings: rows,
    });
  } catch {
    return jsonError({ code: "INTERNAL_ERROR", message: "Doslo je do neocekivane greske na serveru." }, 500);
  }
}
