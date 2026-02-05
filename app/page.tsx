import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <section className="space-y-8">
      <header className="relative overflow-hidden rounded-2xl border border-slate-200">
        <div className="relative h-[430px]">
          <Image
            src="/images/hero.jpg"
            alt="Trkači treniraju zajedno"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/45 to-transparent" />
          <div className="absolute inset-0 p-8 sm:p-10">
            <div className="max-w-xl">
              <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-100">
                Runly
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
                Pronađi idealnog partnera za trčanje.
              </h1>
              <p className="mt-4 text-sm text-slate-200 sm:text-base">
                Poveži se po tempu, terminu i lokaciji. Treniraj redovno sa ljudima koji trče kao
                ti.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/login"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300"
        >
          <h2 className="text-xl font-semibold">Prijava</h2>
          <p className="mt-2 text-sm text-slate-600">
            Koristi test kredencijale i nastavi na glavnu stranicu aplikacije.
          </p>
        </Link>
        <Link
          href="/register"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300"
        >
          <h2 className="text-xl font-semibold">Registracija</h2>
          <p className="mt-2 text-sm text-slate-600">
            Kreiraj test nalog (samo frontend) za proveru toka aplikacije.
          </p>
        </Link>
      </div>
    </section>
  );
}
