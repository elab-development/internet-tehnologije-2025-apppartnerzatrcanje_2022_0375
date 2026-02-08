import { desc, eq } from "drizzle-orm";
import { locations, runUsers, runs, users } from "@/drizzle/schema";
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
        runId: runs.runId,
        title: runs.title,
        startsAt: runs.startsAt,
        hostUserId: runs.hostUserId,
        hostUsername: users.korisnickoIme,
        city: locations.city,
        municipality: locations.municipality,
        participantUserId: runUsers.userId,
      })
      .from(runs)
      .innerJoin(users, eq(runs.hostUserId, users.userId))
      .innerJoin(locations, eq(runs.locationId, locations.locationId))
      .leftJoin(runUsers, eq(runUsers.runId, runs.runId))
      .orderBy(desc(runs.startsAt));

    const map = new Map<
      number,
      {
        runId: number;
        title: string;
        startsAtIso: string;
        hostUserId: number;
        hostUsername: string;
        city: string;
        municipality: string;
        participantsCount: number;
      }
    >();

    for (const row of rows) {
      const existing = map.get(row.runId);
      if (existing) {
        if (row.participantUserId !== null) {
          existing.participantsCount += 1;
        }
        continue;
      }

      map.set(row.runId, {
        runId: row.runId,
        title: row.title,
        startsAtIso: row.startsAt.toISOString(),
        hostUserId: row.hostUserId,
        hostUsername: row.hostUsername,
        city: row.city,
        municipality: row.municipality,
        participantsCount: row.participantUserId === null ? 0 : 1,
      });
    }

    return jsonSuccess({ runs: Array.from(map.values()) });
  } catch {
    return jsonError({ code: "INTERNAL_ERROR", message: "Unexpected server error." }, 500);
  }
}
