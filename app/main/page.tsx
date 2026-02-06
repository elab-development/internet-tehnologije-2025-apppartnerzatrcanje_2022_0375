import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { Card, CardText, CardTitle } from "@/components/ui/card";

const cards = [
  {
    title: "Profil",
    description: "Kreiraj profil trkača: godine, tempo, nivo kondicije i grad.",
    href: "/profile",
  },
  {
    title: "Treninzi",
    description: "Kreiraj, pregledaj i filtriraj treninge po lokaciji i datumu.",
    href: "/runs",
  },
  {
    title: "Mapa",
    description: "Prikaz obližnjih aktivnosti na interaktivnoj mapi.",
    href: "/map",
  },
  {
    title: "Moji Treninzi",
    description: "Treninzi u kojima učestvuješ i grupni chat unutar svakog treninga.",
    href: "/chat",
  },
  {
    title: "Admin",
    description: "Administracija korisnika i moderacija sistema.",
    href: "/admin",
  },
];

export default async function MainPage() {
  await requireAuth();

  return (
    <section className="space-y-8">
      <header className="rounded-3xl border border-[var(--color-track-soft)] bg-gradient-to-r from-[#3c7d6a] via-[#4a9a82] to-[#c98a72] p-8 text-center text-white">
        <h1 className="text-4xl font-bold tracking-tight">Runly Glavna Stranica</h1>
        <p className="mx-auto mt-3 max-w-2xl text-emerald-50">
          Glavni moduli za pretragu partnera, treninge i grupne poruke.
        </p>
      </header>

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
