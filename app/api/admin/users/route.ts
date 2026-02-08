import { desc } from "drizzle-orm";
import { runUsers, runs, users } from "@/drizzle/schema";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return jsonError({ code: "UNAUTHORIZED", message: "Not authenticated." }, 401);
    }

    if (authUser.role !== "admin") {
      return jsonError({ code: "FORBIDDEN", message: "Admin access required." }, 403);
    }

    const rows = await db
      .select({
        userId: users.userId,
        email: users.email,
        korisnickoIme: users.korisnickoIme,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    const hostedRunCounts = await db
      .select({
        userId: runs.hostUserId,
      })
      .from(runs);

    const joinedRunCounts = await db
      .select({
        userId: runUsers.userId,
      })
      .from(runUsers);

    const hostedMap = new Map<number, number>();
    const joinedMap = new Map<number, number>();

    for (const row of hostedRunCounts) {
      hostedMap.set(row.userId, (hostedMap.get(row.userId) ?? 0) + 1);
    }
    for (const row of joinedRunCounts) {
      joinedMap.set(row.userId, (joinedMap.get(row.userId) ?? 0) + 1);
    }

    return jsonSuccess({
      users: rows.map((row) => ({
        userId: row.userId,
        email: row.email,
        korisnickoIme: row.korisnickoIme,
        role: row.role,
        createdAtIso: row.createdAt.toISOString(),
        hostedRunsCount: hostedMap.get(row.userId) ?? 0,
        joinedRunsCount: joinedMap.get(row.userId) ?? 0,
        isCurrentAdmin: row.userId === authUser.userId,
      })),
    });
  } catch {
    return jsonError({ code: "INTERNAL_ERROR", message: "Unexpected server error." }, 500);
  }
}
