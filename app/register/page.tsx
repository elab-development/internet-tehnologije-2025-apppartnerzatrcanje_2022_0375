"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <section className="mx-auto max-w-md space-y-6">
      <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Registracija</h1>
      <form
        className="space-y-3"
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
        <Card className="space-y-3">
          <InputField
            label="Korisničko ime"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
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
          <InputField
            label="Potvrdi lozinku"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button className="w-full" type="submit">
            Kreiraj nalog
          </Button>
        </Card>
      </form>
      <p className="text-sm text-[var(--color-muted)]">
        Već imaš nalog?{" "}
        <Link href="/login" className="font-semibold text-[var(--color-track-strong)] hover:underline">
          Prijavi se
        </Link>
        .
      </p>
    </section>
  );
}
