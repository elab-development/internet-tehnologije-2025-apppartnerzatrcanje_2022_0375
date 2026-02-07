"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        error?: { message?: string };
      };

      if (!response.ok || !payload.success) {
        setError(payload.error?.message ?? "Neuspešna prijava.");
        return;
      }

      router.push("/main");
      router.refresh();
    } catch {
      setError("Greška na serveru. Pokušaj ponovo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md space-y-6">
      <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Prijava</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
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
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Prijava..." : "Prijavi se"}
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
