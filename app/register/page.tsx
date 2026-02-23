"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { InputField, SelectField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

async function getCaptchaToken(action: string) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey || !window.grecaptcha) {
    return null;
  }

  await new Promise<void>((resolve) => window.grecaptcha?.ready(resolve));
  return window.grecaptcha.execute(siteKey, { action });
}

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [starost, setStarost] = useState("20");
  const [pol, setPol] = useState<"muski" | "zenski" | "drugo">("drugo");
  const [nivoKondicije, setNivoKondicije] = useState<"pocetni" | "srednji" | "napredni">("pocetni");
  const [tempoTrcanja, setTempoTrcanja] = useState("6");
  const [slikaKorisnika, setSlikaKorisnika] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !email.trim() || !password) {
      setError("Sva polja su obavezna.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Lozinke se ne poklapaju.");
      return;
    }

    const parsedStarost = Number(starost);
    const parsedTempo = Number(tempoTrcanja);

    if (!Number.isInteger(parsedStarost) || parsedStarost < 10 || parsedStarost > 120) {
      setError("Starost mora biti ceo broj izmedju 10 i 120.");
      return;
    }

    if (!Number.isFinite(parsedTempo) || parsedTempo <= 0) {
      setError("Tempo trcanja mora biti broj veci od 0.");
      return;
    }

    if (slikaKorisnika.trim()) {
      try {
        new URL(slikaKorisnika.trim());
      } catch {
        setError("URL slike nije ispravan.");
        return;
      }
    }

    setError("");
    setIsSubmitting(true);

    try {
      const captchaToken = await getCaptchaToken("register");
      if (!captchaToken) {
        setError("Captcha nije dostupna. Pokusaj ponovo.");
        return;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          korisnickoIme: username.trim(),
          starost: parsedStarost,
          pol,
          nivoKondicije,
          tempoTrcanja: parsedTempo,
          slikaKorisnika: slikaKorisnika.trim() ? slikaKorisnika.trim() : null,
          captchaToken,
        }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        error?: {
          message?: string;
          details?: {
            fieldErrors?: Record<string, string[] | undefined>;
          };
        };
      };

      if (!response.ok || !payload.success) {
        const fieldErrors = payload.error?.details?.fieldErrors;
        const orderedKeys: Array<keyof NonNullable<typeof fieldErrors>> = [
          "email",
          "password",
          "korisnickoIme",
          "starost",
          "pol",
          "nivoKondicije",
          "tempoTrcanja",
          "slikaKorisnika",
        ];
        const serbianRules: Record<string, string> = {
          email: "Imejl mora biti u ispravnom formatu (npr. ime@domen.com).",
          password: "Lozinka mora imati najmanje 6 karaktera.",
          korisnickoIme: "Korisnicko ime mora imati izmedju 3 i 100 karaktera.",
          starost: "Starost mora biti ceo broj izmedju 10 i 120.",
          pol: "Pol mora biti: muski, zenski ili drugo.",
          nivoKondicije: "Nivo kondicije mora biti: pocetni, srednji ili napredni.",
          tempoTrcanja: "Tempo trcanja mora biti broj veci od 0.",
          slikaKorisnika: "Ako unosite sliku, unesite validan URL.",
        };

        for (const key of orderedKeys) {
          if (fieldErrors?.[key]?.[0]) {
            setError(serbianRules[String(key)] ?? "Proverite unesene podatke.");
            return;
          }
        }

        setError(payload.error?.message ?? "Registracija nije uspela. Proverite sva polja.");
        return;
      }

      router.push("/login");
      router.refresh();
    } catch {
      setError("Greska na serveru. Pokusaj ponovo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md space-y-6">
      <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Registracija</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <Card className="space-y-3">
          <InputField
            label="Korisnicko ime"
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
          <InputField
            label="Starost"
            type="number"
            min={10}
            max={120}
            value={starost}
            onChange={(event) => setStarost(event.target.value)}
          />
          <SelectField
            label="Pol"
            value={pol}
            onChange={(event) => setPol(event.target.value as "muski" | "zenski" | "drugo")}
          >
            <option value="muski">Muski</option>
            <option value="zenski">Zenski</option>
            <option value="drugo">Drugo</option>
          </SelectField>
          <SelectField
            label="Nivo kondicije"
            value={nivoKondicije}
            onChange={(event) =>
              setNivoKondicije(event.target.value as "pocetni" | "srednji" | "napredni")
            }
          >
            <option value="pocetni">Pocetni</option>
            <option value="srednji">Srednji</option>
            <option value="napredni">Napredni</option>
          </SelectField>
          <InputField
            label="Tempo trcanja (min/km)"
            type="number"
            step="0.1"
            min="0.1"
            value={tempoTrcanja}
            onChange={(event) => setTempoTrcanja(event.target.value)}
          />
          <InputField
            label="URL slike korisnika (opciono)"
            type="url"
            value={slikaKorisnika}
            onChange={(event) => setSlikaKorisnika(event.target.value)}
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Kreiranje..." : "Kreiraj nalog"}
          </Button>
        </Card>
      </form>
      <p className="text-sm text-[var(--color-muted)]">
        Vec imas nalog?{" "}
        <Link href="/login" className="font-semibold text-[var(--color-track-strong)] hover:underline">
          Prijavi se
        </Link>
        .
      </p>
    </section>
  );
}
