import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { messages, runUsers, runs } from "@/drizzle/schema";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{ runId: string; messageId: string }>;
};

const updateMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Poruka ne moze biti prazna.")
    .max(1000, "Poruka moze imati najvise 1000 karaktera."),
});

async function validateMembership(runId: number, userId: number) {
  const run = await db.query.runs.findFirst({
    where: eq(runs.runId, runId),
    columns: { runId: true },
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
          message: "Samo clanovi treninga mogu menjati poruke.",
        },
        403
      ),
    };
  }

  return { ok: true };
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return jsonError({ code: "UNAUTHORIZED", message: "Not authenticated." }, 401);
    }

    const { runId: runIdParam, messageId: messageIdParam } = await context.params;
    const runId = Number(runIdParam);
    const messageId = Number(messageIdParam);
    if (!Number.isInteger(runId) || runId <= 0 || !Number.isInteger(messageId) || messageId <= 0) {
      return jsonError({ code: "VALIDATION_ERROR", message: "Neispravan ID." }, 400);
    }

    const membership = await validateMembership(runId, authUser.userId);
    if ("error" in membership) {
      return membership.error;
    }

    const existingMessage = await db.query.messages.findFirst({
      where: and(eq(messages.messageId, messageId), eq(messages.runId, runId)),
      columns: { messageId: true, fromUserId: true },
    });

    if (!existingMessage) {
      return jsonError({ code: "NOT_FOUND", message: "Poruka nije pronadjena." }, 404);
    }

    if (existingMessage.fromUserId !== authUser.userId) {
      return jsonError({ code: "FORBIDDEN", message: "Mozes menjati samo svoje poruke." }, 403);
    }

    const body = await request.json();
    const parsed = updateMessageSchema.safeParse(body);
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

    const [updated] = await db
      .update(messages)
      .set({ content: parsed.data.content })
      .where(eq(messages.messageId, messageId))
      .returning({
        messageId: messages.messageId,
        content: messages.content,
        sentAt: messages.sentAt,
        fromUserId: messages.fromUserId,
      });

    return jsonSuccess({
      message: {
        messageId: updated.messageId,
        content: updated.content,
        sentAtIso: updated.sentAt.toISOString(),
        fromUserId: updated.fromUserId,
        fromUsername: authUser.korisnickoIme,
      },
    });
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

    const { runId: runIdParam, messageId: messageIdParam } = await context.params;
    const runId = Number(runIdParam);
    const messageId = Number(messageIdParam);
    if (!Number.isInteger(runId) || runId <= 0 || !Number.isInteger(messageId) || messageId <= 0) {
      return jsonError({ code: "VALIDATION_ERROR", message: "Neispravan ID." }, 400);
    }

    const membership = await validateMembership(runId, authUser.userId);
    if ("error" in membership) {
      return membership.error;
    }

    const existingMessage = await db.query.messages.findFirst({
      where: and(eq(messages.messageId, messageId), eq(messages.runId, runId)),
      columns: { messageId: true, fromUserId: true },
    });

    if (!existingMessage) {
      return jsonError({ code: "NOT_FOUND", message: "Poruka nije pronadjena." }, 404);
    }

    if (existingMessage.fromUserId !== authUser.userId) {
      return jsonError({ code: "FORBIDDEN", message: "Mozes brisati samo svoje poruke." }, 403);
    }

    await db.delete(messages).where(eq(messages.messageId, messageId));
    return jsonSuccess({ deleted: true });
  } catch {
    return jsonError({ code: "INTERNAL_ERROR", message: "Doslo je do neocekivane greske na serveru." }, 500);
  }
}
