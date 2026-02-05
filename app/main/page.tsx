import Link from "next/link";
import { requireAuth } from "@/lib/auth";

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
    title: "Ocene",
    description: "Ostavi utisak nakon zajednickog treninga.",
    href: "/ratings",
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
      <header className="rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 p-8 text-white">
        <h1 className="text-4xl font-bold tracking-tight">Runly Glavna Stranica</h1>
        <p className="mt-3 max-w-2xl text-emerald-50">
          Glavni moduli za pretragu partnera, treninge, poruke, ocene i admin deo.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300"
          >
            <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
