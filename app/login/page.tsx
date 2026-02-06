"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";

const MOCK_EMAIL = "demo@runly.com";
const MOCK_PASSWORD = "runly123";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <section className="mx-auto max-w-md space-y-6">
      <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Prijava</h1>
      <Card className="border-[var(--color-track-soft)] bg-emerald-50">
        <p className="text-sm text-emerald-800">
          Test kredencijali: <strong>{MOCK_EMAIL}</strong> / <strong>{MOCK_PASSWORD}</strong>
        </p>
      </Card>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (email.trim() === MOCK_EMAIL && password === MOCK_PASSWORD) {
            setError("");
            document.cookie = "runly_auth=1; path=/; samesite=lax";
            router.push("/main");
            router.refresh();
            return;
          }
          setError("Neispravni test kredencijali.");
        }}
      >
        <Card className="space-y-3">
          <InputField
            label="Imejl"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <InputField
            label="Lozinka"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button className="w-full" type="submit">
            Prijavi se
          </Button>
        </Card>
      </form>
      <p className="text-sm text-[var(--color-muted)]">
        Nemaš nalog?{" "}
        <Link href="/register" className="font-semibold text-[var(--color-track-strong)] hover:underline">
          Registruj se
        </Link>
        .
      </p>
    </section>
  );
}
