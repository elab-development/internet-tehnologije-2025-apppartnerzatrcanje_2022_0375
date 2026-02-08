import Link from "next/link";
import { and, asc, desc, eq, gte } from "drizzle-orm";
import { locations, messages, runUsers, runs, users } from "@/drizzle/schema";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardText, CardTitle } from "@/components/ui/card";

const cards = [
  {
    title: "Profil",
    description: "Kreiraj profil trkaca: godine, tempo, nivo kondicije i grad.",
    href: "/profile",
  },
  {
    title: "Treninzi",
    description: "Kreiraj, pregledaj i filtriraj treninge po lokaciji i datumu.",
    href: "/runs",
  },
  {
    title: "Mapa",
    description: "Prikaz obliznjih aktivnosti na interaktivnoj mapi.",
    href: "/map",
  },
  {
    title: "Moji Treninzi",
    description: "Treninzi u kojima ucestvujes i grupni chat unutar svakog treninga.",
    href: "/chat",
  },
  {
    title: "Admin",
    description: "Administracija korisnika i moderacija sistema.",
    href: "/admin",
  },
];

function formatDateTime(value: string) {
  const date = new Date(value);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export default async function MainPage() {
  const authUser = await requireAuth();
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
      runTitle: runs.title,
      fromUsername: users.korisnickoIme,
    })
    .from(messages)
    .innerJoin(runs, eq(messages.runId, runs.runId))
    .innerJoin(users, eq(messages.fromUserId, users.userId))
    .innerJoin(runUsers, and(eq(runUsers.runId, runs.runId), eq(runUsers.userId, authUser.userId)))
    .orderBy(desc(messages.sentAt))
    .limit(8);

  return (
    <section className="space-y-8">
      <header className="rounded-3xl border border-[var(--color-track-soft)] bg-gradient-to-r from-[#3c7d6a] via-[#4a9a82] to-[#c98a72] p-8 text-center text-white">
        <h1 className="text-4xl font-bold tracking-tight">Runly Glavna Stranica</h1>
        <p className="mx-auto mt-3 max-w-2xl text-emerald-50">
          Glavni moduli za pretragu partnera, treninge i grupne poruke
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle>Moja Statistika</CardTitle>
          <CardText className="mt-2">Ukupno prijavljenih treninga: {totalRows.length}</CardText>
          <CardText>Predstojecih treninga: {upcomingRows.length}</CardText>
        </Card>
        <Card>
          <CardTitle>Naredni Treninzi</CardTitle>
          {upcomingRows.length ? (
            <ul className="mt-2 space-y-2">
              {upcomingRows.map((run) => (
                <li key={run.runId} className="text-sm text-[var(--color-muted)]">
                  <span className="font-medium text-[var(--color-ink)]">{run.title}</span>
                  <span>
                    {" "}
                    ({run.city}, {run.municipality}) - {formatDateTime(run.startsAt.toISOString())}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <CardText className="mt-2">Trenutno nema predstojecih treninga.</CardText>
          )}
        </Card>
      </div>

      <Card>
        <CardTitle>Skorasnje Poruke</CardTitle>
        {recentMessagesRows.length ? (
          <ul className="mt-3 space-y-2">
            {recentMessagesRows.map((message) => (
              <li key={message.messageId} className="rounded-xl border border-[var(--color-line)] bg-white p-3">
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  {message.fromUsername} · {message.runTitle}
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{message.content}</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">{formatDateTime(message.sentAt.toISOString())}</p>
              </li>
            ))}
          </ul>
        ) : (
          <CardText className="mt-2">Jos nema poruka u tvojim treninzima.</CardText>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="h-full transition hover:-translate-y-0.5 hover:border-[var(--color-track)]">
              <CardTitle>{card.title}</CardTitle>
              <CardText className="mt-2">{card.description}</CardText>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
