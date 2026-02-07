import { and, eq } from "drizzle-orm";
import { runUsers, runs } from "@/drizzle/schema";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return jsonError(
        {
          code: "UNAUTHORIZED",
          message: "Not authenticated.",
        },
        401
      );
    }

    const { id } = await context.params;
    const runId = Number(id);

    if (!Number.isInteger(runId) || runId <= 0) {
      return jsonError(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid run id.",
        },
        400
      );
    }

    const runExists = await db.query.runs.findFirst({
      where: eq(runs.runId, runId),
      columns: { runId: true },
    });

    if (!runExists) {
      return jsonError(
        {
          code: "NOT_FOUND",
          message: "Run not found.",
        },
        404
      );
    }

    const existingMembership = await db.query.runUsers.findFirst({
      where: and(eq(runUsers.runId, runId), eq(runUsers.userId, authUser.userId)),
      columns: { runUserId: true },
    });

    if (existingMembership) {
      return jsonSuccess({ joined: true, alreadyJoined: true });
    }

    await db.insert(runUsers).values({
      runId,
      userId: authUser.userId,
    });

    return jsonSuccess({ joined: true });
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
