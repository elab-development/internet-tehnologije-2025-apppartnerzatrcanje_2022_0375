import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { locations, messages, runUsers, runs } from "@/drizzle/schema";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateRunSchema = z.object({
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
});

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return jsonError({ code: "UNAUTHORIZED", message: "Not authenticated." }, 401);
    }

    const { id } = await context.params;
    const runId = Number(id);
    if (!Number.isInteger(runId) || runId <= 0) {
      return jsonError({ code: "VALIDATION_ERROR", message: "Neispravan ID treninga." }, 400);
    }

    const existingRun = await db.query.runs.findFirst({
      where: eq(runs.runId, runId),
      columns: { runId: true, hostUserId: true },
    });

    if (!existingRun) {
      return jsonError({ code: "NOT_FOUND", message: "Trening nije pronadjen." }, 404);
    }

    if (existingRun.hostUserId !== authUser.userId) {
      return jsonError({ code: "FORBIDDEN", message: "Samo kreator moze menjati trening." }, 403);
    }

    const body = await request.json();
    const parsed = updateRunSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        {
          code: "VALIDATION_ERROR",
          message: "Podaci za izmenu treninga nisu ispravni.",
          details: parsed.error.flatten(),
        },
        400
      );
    }

    const startsAt = new Date(parsed.data.startsAtIso);
    if (Number.isNaN(startsAt.getTime())) {
      return jsonError({ code: "VALIDATION_ERROR", message: "Datum i vreme pocetka nisu validni." }, 400);
    }

    const existingLocation = await db.query.locations.findFirst({
      where: and(eq(locations.city, parsed.data.city), eq(locations.municipality, parsed.data.municipality)),
      columns: { locationId: true },
    });

    let locationId = existingLocation?.locationId;
    if (!locationId) {
      const [createdLocation] = await db
        .insert(locations)
        .values({
          city: parsed.data.city,
          municipality: parsed.data.municipality,
        })
        .returning({ locationId: locations.locationId });
      locationId = createdLocation.locationId;
    }

    const [updated] = await db
      .update(runs)
      .set({
        title: parsed.data.title,
        route: parsed.data.route,
        startsAt,
        distanceKm: parsed.data.distanceKm,
        paceMinPerKm: parsed.data.paceMinPerKm,
        locationId,
      })
      .where(eq(runs.runId, runId))
      .returning({ runId: runs.runId, title: runs.title });

    return jsonSuccess({ run: updated });
  } catch {
    return jsonError({ code: "INTERNAL_ERROR", message: "Doslo je do neocekivane greske na serveru." }, 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return jsonError({ code: "UNAUTHORIZED", message: "Not authenticated." }, 401);
    }

    const { id } = await context.params;
    const runId = Number(id);
    if (!Number.isInteger(runId) || runId <= 0) {
      return jsonError({ code: "VALIDATION_ERROR", message: "Neispravan ID treninga." }, 400);
    }

    const existingRun = await db.query.runs.findFirst({
      where: eq(runs.runId, runId),
      columns: { runId: true, hostUserId: true },
    });

    if (!existingRun) {
      return jsonError({ code: "NOT_FOUND", message: "Trening nije pronadjen." }, 404);
    }

    if (existingRun.hostUserId !== authUser.userId) {
      return jsonError({ code: "FORBIDDEN", message: "Samo kreator moze obrisati trening." }, 403);
    }

    await db.delete(messages).where(eq(messages.runId, runId));
    await db.delete(runUsers).where(eq(runUsers.runId, runId));
    await db.delete(runs).where(eq(runs.runId, runId));

    return jsonSuccess({ deleted: true });
  } catch {
    return jsonError({ code: "INTERNAL_ERROR", message: "Doslo je do neocekivane greske na serveru." }, 500);
  }
}
