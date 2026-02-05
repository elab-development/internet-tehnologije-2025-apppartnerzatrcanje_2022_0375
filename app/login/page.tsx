"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MOCK_EMAIL = "demo@runly.com";
const MOCK_PASSWORD = "runly123";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <section className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-semibold">Prijava</h1>
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
        Test kredencijali: <strong>{MOCK_EMAIL}</strong> / <strong>{MOCK_PASSWORD}</strong>
      </div>
      <form
        className="space-y-3 rounded-xl border border-slate-200 bg-white p-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (email.trim() === MOCK_EMAIL && password === MOCK_PASSWORD) {
            setError("");
            document.cookie = "runly_auth=1; path=/; max-age=86400; samesite=lax";
            router.push("/main");
            router.refresh();
            return;
          }
          setError("Neispravni test kredencijali.");
        }}
      >
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-slate-500">Imejl</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-slate-500">Lozinka</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          />
        </label>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <button className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          Prijavi se
        </button>
      </form>
      <p className="text-sm text-slate-600">
        Nemaš nalog?{" "}
        <Link href="/register" className="font-medium text-emerald-700 hover:underline">
          Registruj se
        </Link>
        .
      </p>
    </section>
  );
}
