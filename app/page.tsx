import Image from "next/image";
import Link from "next/link";
import { Card, CardText, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <section className="space-y-8">
      <header className="relative overflow-hidden rounded-3xl border border-[var(--color-line)]">
        <div className="relative h-[430px]">
          <Image
            src="/images/hero.jpg"
            alt="Trkači treniraju zajedno"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/40 to-transparent" />
          <div className="absolute inset-0 p-8 sm:p-10">
            <div className="max-w-xl">
              <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-100">
                Runly
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
                Pronađi idealnog partnera za trčanje.
              </h1>
              <p className="mt-4 text-sm text-slate-100 sm:text-base">
                Poveži se po tempu, terminu i lokaciji. Treniraj redovno i motivisano.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/login">
          <Card className="h-full transition hover:-translate-y-0.5 hover:border-[var(--color-track)]">
            <CardTitle>Prijava</CardTitle>
            <CardText className="mt-2">
              Koristi test kredencijale i nastavi na glavnu stranicu aplikacije.
            </CardText>
          </Card>
        </Link>
        <Link href="/register">
          <Card className="h-full transition hover:-translate-y-0.5 hover:border-[var(--color-track)]">
            <CardTitle>Registracija</CardTitle>
            <CardText className="mt-2">
              Kreiraj test nalog (samo frontend) za proveru toka aplikacije.
            </CardText>
          </Card>
        </Link>
      </div>
    </section>
  );
}
