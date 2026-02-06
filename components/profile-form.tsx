"use client";

import { useState } from "react";
import { users } from "@/lib/mock-data";
import type { FitnessLevel } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputField, SelectField } from "@/components/ui/input-field";

type Gender = "muski" | "zenski" | "drugo";

type ProfileFormState = {
  username: string;
  age: string;
  gender: Gender;
  fitnessLevel: FitnessLevel;
  runningPaceMinPerKm: string;
  city: string;
};

export function ProfileForm() {
  const user = users[0];
  const [form, setForm] = useState<ProfileFormState>({
    username: user.username,
    age: String(user.age),
    gender: user.gender,
    fitnessLevel: user.fitnessLevel,
    runningPaceMinPerKm: String(user.runningPaceMinPerKm),
    city: user.city,
  });
  const [saved, setSaved] = useState(false);

  return (
    <Card>
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <InputField
          label="Korisničko ime"
          value={form.username}
          onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
        />
        <InputField
          label="Godine"
          type="number"
          value={form.age}
          onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))}
        />
        <SelectField
          label="Pol"
          value={form.gender}
          onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value as Gender }))}
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
          onChange={(event) =>
            setForm((current) => ({ ...current, runningPaceMinPerKm: event.target.value }))
          }
        />
        <InputField
          label="Grad"
          value={form.city}
          onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
        />
        <div className="flex items-center gap-3 sm:col-span-2">
          <Button type="submit">Sačuvaj profil</Button>
          {saved ? <p className="text-sm text-[var(--color-track-strong)]">Sačuvano lokalno.</p> : null}
        </div>
      </form>
    </Card>
  );
}
