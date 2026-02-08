import { and, asc, desc, eq, gte } from "drizzle-orm";
import { locations, messages, runUsers, runs, users } from "@/drizzle/schema";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
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

    const now = new Date();
    const upcomingRows = await db
      .select({
        runId: runs.runId,
        title: runs.title,
        startsAt: runs.startsAt,
        city: locations.city,
        municipality: locations.municipality,
      })
      .from(runUsers)
      .innerJoin(runs, eq(runUsers.runId, runs.runId))
      .innerJoin(locations, eq(runs.locationId, locations.locationId))
      .where(and(eq(runUsers.userId, authUser.userId), gte(runs.startsAt, now)))
      .orderBy(asc(runs.startsAt))
      .limit(5);

    const totalRows = await db
      .select({ runUserId: runUsers.runUserId })
      .from(runUsers)
      .where(eq(runUsers.userId, authUser.userId));

    const recentMessagesRows = await db
      .select({
        messageId: messages.messageId,
        content: messages.content,
        sentAt: messages.sentAt,
        runId: messages.runId,
        runTitle: runs.title,
        fromUserId: users.userId,
        fromUsername: users.korisnickoIme,
      })
      .from(messages)
      .innerJoin(runs, eq(messages.runId, runs.runId))
      .innerJoin(users, eq(messages.fromUserId, users.userId))
      .innerJoin(runUsers, and(eq(runUsers.runId, runs.runId), eq(runUsers.userId, authUser.userId)))
      .orderBy(desc(messages.sentAt))
      .limit(8);

    return jsonSuccess({
      stats: {
        joinedRunsCount: totalRows.length,
        upcomingRunsCount: upcomingRows.length,
      },
      upcomingRuns: upcomingRows.map((row) => ({
        runId: row.runId,
        title: row.title,
        startsAtIso: row.startsAt.toISOString(),
        location: {
          city: row.city,
          municipality: row.municipality,
        },
      })),
      recentMessages: recentMessagesRows.map((row) => ({
        messageId: row.messageId,
        content: row.content,
        sentAtIso: row.sentAt.toISOString(),
        runId: row.runId,
        runTitle: row.runTitle,
        fromUserId: row.fromUserId,
        fromUsername: row.fromUsername,
      })),
    });
  } catch {
    return jsonError(
      {
        code: "INTERNAL_ERROR",
        message: "Doslo je do neocekivane greske na serveru.",
      },
      500
    );
  }
}
