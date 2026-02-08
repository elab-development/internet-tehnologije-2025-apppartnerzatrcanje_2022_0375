import { eq } from "drizzle-orm";
import { messages, ratings, runUsers, runs, sessions, users } from "@/drizzle/schema";
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
    const userId = Number(id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return jsonError({ code: "VALIDATION_ERROR", message: "Invalid user id." }, 400);
    }

    if (userId === authUser.userId) {
      return jsonError({ code: "FORBIDDEN", message: "You cannot delete your own admin account." }, 403);
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.userId, userId),
      columns: { userId: true },
    });

    if (!existingUser) {
      return jsonError({ code: "NOT_FOUND", message: "User not found." }, 404);
    }

    const hostedRuns = await db
      .select({ runId: runs.runId })
      .from(runs)
      .where(eq(runs.hostUserId, userId));
    const hostedRunIds = hostedRuns.map((row) => row.runId);

    await db.transaction(async (tx) => {
      for (const runId of hostedRunIds) {
        await tx.delete(messages).where(eq(messages.runId, runId));
        await tx.delete(runUsers).where(eq(runUsers.runId, runId));
        await tx.delete(ratings).where(eq(ratings.runId, runId));
        await tx.delete(runs).where(eq(runs.runId, runId));
      }

      await tx.delete(messages).where(eq(messages.fromUserId, userId));
      await tx.delete(messages).where(eq(messages.toUserId, userId));
      await tx.delete(ratings).where(eq(ratings.fromUserId, userId));
      await tx.delete(ratings).where(eq(ratings.toUserId, userId));
      await tx.delete(runUsers).where(eq(runUsers.userId, userId));
      await tx.delete(sessions).where(eq(sessions.userId, userId));
      await tx.delete(users).where(eq(users.userId, userId));
    });

    return jsonSuccess({ deleted: true });
  } catch {
    return jsonError({ code: "INTERNAL_ERROR", message: "Unexpected server error." }, 500);
  }
}
