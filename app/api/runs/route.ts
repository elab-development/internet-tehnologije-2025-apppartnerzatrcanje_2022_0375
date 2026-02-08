import { and, asc, eq, inArray, lte, or, sql } from "drizzle-orm";
import { z } from "zod";
import { locations, ratings, runUsers, runs, users } from "@/drizzle/schema";
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
  title: z
    .string()
    .trim()
    .min(3, "Naziv treninga mora imati najmanje 3 karaktera.")
    .max(120, "Naziv treninga moze imati najvise 120 karaktera."),
  route: z.string().trim().min(3, "Ruta mora imati najmanje 3 karaktera."),
  startsAtIso: z.string().datetime("Datum i vreme pocetka nisu validni."),
  distanceKm: z.coerce
    .number({ message: "Duzina mora biti broj." })
    .positive("Duzina mora biti veca od 0."),
  paceMinPerKm: z.coerce
    .number({ message: "Tempo mora biti broj." })
    .positive("Tempo mora biti veci od 0."),
  city: z
    .string()
    .trim()
    .min(2, "Grad mora imati najmanje 2 karaktera.")
    .max(100, "Grad moze imati najvise 100 karaktera."),
  municipality: z
    .string()
    .trim()
    .min(2, "Opstina mora imati najmanje 2 karaktera.")
    .max(100, "Opstina moze imati najvise 100 karaktera."),
  lat: z.coerce.number().min(-90, "Latitude mora biti izmedju -90 i 90.").max(90, "Latitude mora biti izmedju -90 i 90."),
  lng: z
    .coerce
    .number()
    .min(-180, "Longitude mora biti izmedju -180 i 180.")
    .max(180, "Longitude mora biti izmedju -180 i 180."),
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
        locationLat: locations.lat,
        locationLng: locations.lng,
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
        location: { locationId: number; city: string; municipality: string; lat: number | null; lng: number | null };
        host: { userId: number; korisnickoIme: string };
        participantUserIds: number[];
        ratedByCurrentUser: boolean;
        currentUserRating: { ratingId: number; score: number; comment: string } | null;
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
          lat: row.locationLat,
          lng: row.locationLng,
        },
        host: {
          userId: row.hostUserId,
          korisnickoIme: row.hostUsername,
        },
        participantUserIds: row.participantUserId !== null ? [row.participantUserId] : [],
        ratedByCurrentUser: false,
        currentUserRating: null,
      });
    }

    const runIds = Array.from(runsMap.keys());
    if (runIds.length > 0) {
      const currentUserRatings = await db
        .select({
          runId: ratings.runId,
        })
        .from(ratings)
        .where(and(eq(ratings.fromUserId, authUser.userId), inArray(ratings.runId, runIds)));

      for (const row of currentUserRatings) {
        const run = runsMap.get(row.runId);
        if (run) {
          run.ratedByCurrentUser = true;
        }
      }

      const currentUserRatingRows = await db
        .select({
          runId: ratings.runId,
          ratingId: ratings.ratingId,
          score: ratings.score,
          comment: ratings.comment,
        })
        .from(ratings)
        .where(and(eq(ratings.fromUserId, authUser.userId), inArray(ratings.runId, runIds)));

      for (const row of currentUserRatingRows) {
        const run = runsMap.get(row.runId);
        if (run) {
          run.currentUserRating = {
            ratingId: row.ratingId,
            score: row.score,
            comment: row.comment,
          };
        }
      }
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
          message: "Podaci za kreiranje treninga nisu ispravni.",
          details: parsed.error.flatten(),
        },
        400
      );
    }

    const payload = parsed.data;
    const startsAt = new Date(payload.startsAtIso);
    if (Number.isNaN(startsAt.getTime())) {
      return jsonError(
        {
          code: "VALIDATION_ERROR",
          message: "Datum i vreme pocetka nisu validni.",
        },
        400
      );
    }

    if (startsAt.getTime() <= Date.now()) {
      return jsonError(
        {
          code: "VALIDATION_ERROR",
          message: "Pocetak treninga mora biti u buducnosti.",
        },
        400
      );
    }

    const existingLocation = await db.query.locations.findFirst({
      where: and(eq(locations.city, payload.city), eq(locations.municipality, payload.municipality)),
      columns: { locationId: true, lat: true, lng: true },
    });

    let locationId = existingLocation?.locationId;
    if (!locationId) {
      const [createdLocation] = await db
        .insert(locations)
        .values({
          city: payload.city,
          municipality: payload.municipality,
          lat: payload.lat ?? null,
          lng: payload.lng ?? null,
        })
        .returning({
          locationId: locations.locationId,
        });
      locationId = createdLocation.locationId;
    } else if (payload.lat !== undefined && payload.lng !== undefined) {
      await db
        .update(locations)
        .set({
          lat: payload.lat,
          lng: payload.lng,
        })
        .where(eq(locations.locationId, locationId));
    }

    const [createdRun] = await db
      .insert(runs)
      .values({
        title: payload.title,
        route: payload.route,
        startsAt,
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
        message: "Doslo je do neocekivane greske na serveru.",
      },
      500
    );
  }
}
