import { eq } from "drizzle-orm";
import { messages, ratings, runUsers, runs } from "@/drizzle/schema";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return jsonError({ code: "UNAUTHORIZED", message: "Not authenticated." }, 401);
    }

    if (authUser.role !== "admin") {
      return jsonError({ code: "FORBIDDEN", message: "Admin access required." }, 403);
    }

    const { id } = await context.params;
    const runId = Number(id);
    if (!Number.isInteger(runId) || runId <= 0) {
      return jsonError({ code: "VALIDATION_ERROR", message: "Invalid run id." }, 400);
    }

    const existingRun = await db.query.runs.findFirst({
      where: eq(runs.runId, runId),
      columns: { runId: true },
    });

    if (!existingRun) {
      return jsonError({ code: "NOT_FOUND", message: "Run not found." }, 404);
    }

    await db.transaction(async (tx) => {
      await tx.delete(messages).where(eq(messages.runId, runId));
      await tx.delete(runUsers).where(eq(runUsers.runId, runId));
      await tx.delete(ratings).where(eq(ratings.runId, runId));
      await tx.delete(runs).where(eq(runs.runId, runId));
    });

    return jsonSuccess({ deleted: true });
  } catch {
    return jsonError({ code: "INTERNAL_ERROR", message: "Unexpected server error." }, 500);
  }
}
