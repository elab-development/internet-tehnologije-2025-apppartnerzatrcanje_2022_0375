"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <section className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-semibold">Registracija</h1>
      <form
        className="space-y-3 rounded-xl border border-slate-200 bg-white p-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!username.trim() || !email.trim() || !password) {
            setError("Sva polja su obavezna.");
            return;
          }
          if (password !== confirmPassword) {
            setError("Lozinke se ne poklapaju.");
            return;
          }
          setError("");
          router.push("/login");
        }}
      >
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-slate-500">Korisničko ime</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          />
        </label>
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
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-slate-500">Potvrdi lozinku</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          />
        </label>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <button className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          Kreiraj nalog
        </button>
      </form>
      <p className="text-sm text-slate-600">
        Već imaš nalog?{" "}
        <Link href="/login" className="font-medium text-emerald-700 hover:underline">
          Prijavi se
        </Link>
        .
      </p>
    </section>
  );
}
