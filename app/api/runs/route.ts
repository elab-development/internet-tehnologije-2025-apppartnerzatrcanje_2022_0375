import { and, asc, eq, lte, or, sql } from "drizzle-orm";
import { z } from "zod";
import { locations, runUsers, runs, users } from "@/drizzle/schema";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

const runsQuerySchema = z.object({
  q: z.string().trim().optional(),
  maxPace: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) {
        return undefined;
      }
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : Number.NaN;
    })
    .refine((value) => value === undefined || (Number.isFinite(value) && value > 0), {
      message: "maxPace must be a positive number.",
    }),
});

const createRunSchema = z.object({
  title: z.string().trim().min(3).max(120),
  route: z.string().trim().min(3),
  startsAtIso: z.string().datetime(),
  distanceKm: z.coerce.number().positive(),
  paceMinPerKm: z.coerce.number().positive(),
  city: z.string().trim().min(2).max(100),
  municipality: z.string().trim().min(2).max(100),
});

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const parsed = runsQuerySchema.safeParse({
      q: url.searchParams.get("q") ?? undefined,
      maxPace: url.searchParams.get("maxPace") ?? undefined,
    });

    if (!parsed.success) {
      return jsonError(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid runs query.",
          details: parsed.error.flatten(),
        },
        400
      );
    }

    const { q, maxPace } = parsed.data;
    const filters = [];

    if (q && q.length > 0) {
      const qLower = `%${q.toLowerCase()}%`;
      filters.push(
        or(
          sql`lower(${runs.title}) like ${qLower}`,
          sql`lower(${runs.route}) like ${qLower}`,
          sql`lower(${locations.city}) like ${qLower}`,
          sql`lower(${locations.municipality}) like ${qLower}`
        )
      );
    }

    if (maxPace !== undefined) {
      filters.push(lte(runs.paceMinPerKm, maxPace));
    }

    const rows = await db
      .select({
        runId: runs.runId,
        title: runs.title,
        route: runs.route,
        startsAt: runs.startsAt,
        distanceKm: runs.distanceKm,
        paceMinPerKm: runs.paceMinPerKm,
        locationId: runs.locationId,
        locationCity: locations.city,
        locationMunicipality: locations.municipality,
        hostUserId: users.userId,
        hostUsername: users.korisnickoIme,
        participantUserId: runUsers.userId,
      })
      .from(runs)
      .innerJoin(locations, eq(runs.locationId, locations.locationId))
      .innerJoin(users, eq(runs.hostUserId, users.userId))
      .leftJoin(runUsers, eq(runs.runId, runUsers.runId))
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(asc(runs.startsAt));

    const runsMap = new Map<
      number,
      {
        runId: number;
        title: string;
        route: string;
        startsAtIso: string;
        distanceKm: number;
        paceMinPerKm: number;
        location: { locationId: number; city: string; municipality: string };
        host: { userId: number; korisnickoIme: string };
        participantUserIds: number[];
      }
    >();

    for (const row of rows) {
      const existing = runsMap.get(row.runId);
      if (existing) {
        if (row.participantUserId !== null && !existing.participantUserIds.includes(row.participantUserId)) {
          existing.participantUserIds.push(row.participantUserId);
        }
        continue;
      }

      runsMap.set(row.runId, {
        runId: row.runId,
        title: row.title,
        route: row.route,
        startsAtIso: row.startsAt.toISOString(),
        distanceKm: row.distanceKm,
        paceMinPerKm: row.paceMinPerKm,
        location: {
          locationId: row.locationId,
          city: row.locationCity,
          municipality: row.locationMunicipality,
        },
        host: {
          userId: row.hostUserId,
          korisnickoIme: row.hostUsername,
        },
        participantUserIds: row.participantUserId !== null ? [row.participantUserId] : [],
      });
    }

    return jsonSuccess({
      runs: Array.from(runsMap.values()),
      currentUserId: authUser.userId,
    });
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

export async function POST(request: Request) {
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

    const body = await request.json();
    const parsed = createRunSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid run payload.",
          details: parsed.error.flatten(),
        },
        400
      );
    }

    const payload = parsed.data;
    const existingLocation = await db.query.locations.findFirst({
      where: and(eq(locations.city, payload.city), eq(locations.municipality, payload.municipality)),
      columns: { locationId: true },
    });

    let locationId = existingLocation?.locationId;
    if (!locationId) {
      const [createdLocation] = await db
        .insert(locations)
        .values({
          city: payload.city,
          municipality: payload.municipality,
        })
        .returning({
          locationId: locations.locationId,
        });
      locationId = createdLocation.locationId;
    }

    const [createdRun] = await db
      .insert(runs)
      .values({
        title: payload.title,
        route: payload.route,
        startsAt: new Date(payload.startsAtIso),
        distanceKm: payload.distanceKm,
        paceMinPerKm: payload.paceMinPerKm,
        locationId,
        hostUserId: authUser.userId,
      })
      .returning({
        runId: runs.runId,
        title: runs.title,
      });

    await db.insert(runUsers).values({
      runId: createdRun.runId,
      userId: authUser.userId,
    });

    return jsonSuccess({ run: createdRun }, 201);
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
