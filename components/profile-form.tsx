"use client";

import { useEffect, useState } from "react";
import type { FitnessLevel } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputField, SelectField } from "@/components/ui/input-field";

type Gender = "muski" | "zenski" | "drugo";

type ProfileFormState = {
  korisnickoIme: string;
  age: string;
  gender: Gender;
  fitnessLevel: FitnessLevel;
  runningPaceMinPerKm: string;
  slikaKorisnika: string;
};

export function ProfileForm() {
  const [form, setForm] = useState<ProfileFormState>({
    korisnickoIme: "",
    age: "",
    gender: "muski",
    fitnessLevel: "pocetni",
    runningPaceMinPerKm: "",
    slikaKorisnika: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [creatorRating, setCreatorRating] = useState<{ average: number | null; total: number }>({
    average: null,
    total: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await fetch("/api/profile/me", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error?.message ?? "Neuspesno ucitavanje profila.");
        }

        const user = payload.data.user;
        const rating = payload.data.creatorRating as { average: number | null; total: number } | undefined;
        if (cancelled) {
          return;
        }

        setForm({
          korisnickoIme: user.korisnickoIme ?? "",
          age: String(user.starost ?? ""),
          gender: user.pol ?? "muski",
          fitnessLevel: user.nivoKondicije ?? "pocetni",
          runningPaceMinPerKm: String(user.tempoTrcanja ?? ""),
          slikaKorisnika: user.slikaKorisnika ?? "",
        });
        setCreatorRating({
          average: rating?.average ?? null,
          total: rating?.total ?? 0,
        });
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Doslo je do greske.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card>
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          setSavedMessage(null);
          setErrorMessage(null);

          try {
            setIsSaving(true);
            const response = await fetch("/api/profile/me", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                korisnickoIme: form.korisnickoIme,
                starost: Number(form.age),
                pol: form.gender,
                nivoKondicije: form.fitnessLevel,
                tempoTrcanja: Number(form.runningPaceMinPerKm),
                slikaKorisnika: form.slikaKorisnika.trim() === "" ? null : form.slikaKorisnika,
              }),
            });

            const payload = await response.json();
            if (!response.ok || !payload?.success) {
              throw new Error(payload?.error?.message ?? "Neuspesno cuvanje profila.");
            }

            setSavedMessage("Profil je sacuvan.");
          } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Doslo je do greske.");
          } finally {
            setIsSaving(false);
          }
        }}
      >
        <div className="rounded-md border border-[var(--color-line)] bg-[var(--color-paper)] p-3 sm:col-span-2">
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Prosecna ocena kao kreator</p>
          <p className="text-sm font-medium text-[var(--color-ink)]">
            {creatorRating.average !== null ? `${creatorRating.average}/5 (${creatorRating.total})` : "Jos nema ocena"}
          </p>
        </div>
        <InputField
          label="Korisnicko ime"
          value={form.korisnickoIme}
          onChange={(event) => setForm((current) => ({ ...current, korisnickoIme: event.target.value }))}
          disabled={isLoading || isSaving}
        />
        <InputField
          label="Godine"
          type="number"
          value={form.age}
          onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))}
          disabled={isLoading || isSaving}
        />
        <SelectField
          label="Pol"
          value={form.gender}
          onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value as Gender }))}
          disabled={isLoading || isSaving}
        >
          {["muski", "zenski", "drugo"].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Nivo kondicije"
          value={form.fitnessLevel}
          onChange={(event) =>
            setForm((current) => ({ ...current, fitnessLevel: event.target.value as FitnessLevel }))
          }
          disabled={isLoading || isSaving}
        >
          {["pocetni", "srednji", "napredni"].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </SelectField>
        <InputField
          label="Tempo (min/km)"
          type="number"
          step="0.1"
          value={form.runningPaceMinPerKm}
          onChange={(event) => setForm((current) => ({ ...current, runningPaceMinPerKm: event.target.value }))}
          disabled={isLoading || isSaving}
        />
        <InputField
          label="Slika korisnika (URL)"
          value={form.slikaKorisnika}
          onChange={(event) => setForm((current) => ({ ...current, slikaKorisnika: event.target.value }))}
          disabled={isLoading || isSaving}
        />
        <div className="flex items-center gap-3 sm:col-span-2">
          <Button type="submit" disabled={isLoading || isSaving}>
            {isLoading ? "Ucitavanje..." : isSaving ? "Cuvanje..." : "Sacuvaj profil"}
          </Button>
          {savedMessage ? <p className="text-sm text-[var(--color-track-strong)]">{savedMessage}</p> : null}
          {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}
        </div>
      </form>
    </Card>
  );
}
