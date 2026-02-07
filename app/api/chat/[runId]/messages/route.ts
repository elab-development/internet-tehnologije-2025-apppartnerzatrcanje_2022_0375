import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { messages, runUsers, runs, users } from "@/drizzle/schema";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{ runId: string }>;
};

const createMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Poruka ne moze biti prazna.")
    .max(1000, "Poruka moze imati najvise 1000 karaktera."),
});

async function validateRunMembership(runId: number, userId: number) {
  const run = await db.query.runs.findFirst({
    where: eq(runs.runId, runId),
    columns: {
      runId: true,
      hostUserId: true,
      title: true,
    },
  });

  if (!run) {
    return { error: jsonError({ code: "NOT_FOUND", message: "Trening nije pronadjen." }, 404) };
  }

  const membership = await db.query.runUsers.findFirst({
    where: and(eq(runUsers.runId, runId), eq(runUsers.userId, userId)),
    columns: { runUserId: true },
  });

  if (!membership) {
    return {
      error: jsonError(
        {
          code: "FORBIDDEN",
          message: "Samo clanovi treninga mogu pristupiti chatu.",
        },
        403
      ),
    };
  }

  return { run };
}

export async function GET(_request: Request, context: RouteContext) {
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

    const { runId: runIdParam } = await context.params;
    const runId = Number(runIdParam);
    if (!Number.isInteger(runId) || runId <= 0) {
      return jsonError(
        {
          code: "VALIDATION_ERROR",
          message: "Neispravan ID treninga.",
        },
        400
      );
    }

    const validated = await validateRunMembership(runId, authUser.userId);
    if ("error" in validated) {
      return validated.error;
    }

    const rows = await db
      .select({
        messageId: messages.messageId,
        content: messages.content,
        sentAt: messages.sentAt,
        fromUserId: messages.fromUserId,
        fromUsername: users.korisnickoIme,
      })
      .from(messages)
      .innerJoin(users, eq(messages.fromUserId, users.userId))
      .where(eq(messages.runId, runId))
      .orderBy(asc(messages.sentAt));

    return jsonSuccess({
      run: validated.run,
      messages: rows.map((row) => ({
        messageId: row.messageId,
        content: row.content,
        sentAtIso: row.sentAt.toISOString(),
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

export async function POST(request: Request, context: RouteContext) {
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

    const { runId: runIdParam } = await context.params;
    const runId = Number(runIdParam);
    if (!Number.isInteger(runId) || runId <= 0) {
      return jsonError(
        {
          code: "VALIDATION_ERROR",
          message: "Neispravan ID treninga.",
        },
        400
      );
    }

    const validated = await validateRunMembership(runId, authUser.userId);
    if ("error" in validated) {
      return validated.error;
    }

    const body = await request.json();
    const parsed = createMessageSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        {
          code: "VALIDATION_ERROR",
          message: "Poruka nije validna.",
          details: parsed.error.flatten(),
        },
        400
      );
    }

    const recipientId = validated.run.hostUserId === authUser.userId ? authUser.userId : validated.run.hostUserId;
    const [created] = await db
      .insert(messages)
      .values({
        content: parsed.data.content,
        runId,
        fromUserId: authUser.userId,
        toUserId: recipientId,
        sentAt: new Date(),
      })
      .returning({
        messageId: messages.messageId,
        content: messages.content,
        sentAt: messages.sentAt,
        fromUserId: messages.fromUserId,
      });

    return jsonSuccess(
      {
        message: {
          messageId: created.messageId,
          content: created.content,
          sentAtIso: created.sentAt.toISOString(),
          fromUserId: created.fromUserId,
          fromUsername: authUser.korisnickoIme,
        },
      },
      201
    );
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
