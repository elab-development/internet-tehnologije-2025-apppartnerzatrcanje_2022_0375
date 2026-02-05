"use client";

import { useState } from "react";
import { users } from "@/lib/mock-data";
import type { FitnessLevel } from "@/lib/types";

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
    <form
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <Field
        label="Korisničko ime"
        value={form.username}
        onChange={(value) => setForm((current) => ({ ...current, username: value }))}
      />
      <Field
        label="Godine"
        type="number"
        value={form.age}
        onChange={(value) => setForm((current) => ({ ...current, age: value }))}
      />
      <Select
        label="Pol"
        value={form.gender}
        options={["muski", "zenski", "drugo"]}
        onChange={(value) => setForm((current) => ({ ...current, gender: value as Gender }))}
      />
      <Select
        label="Nivo kondicije"
        value={form.fitnessLevel}
        options={["pocetni", "srednji", "napredni"]}
        onChange={(value) =>
          setForm((current) => ({ ...current, fitnessLevel: value as FitnessLevel }))
        }
      />
      <Field
        label="Tempo (min/km)"
        type="number"
        step="0.1"
        value={form.runningPaceMinPerKm}
        onChange={(value) =>
          setForm((current) => ({ ...current, runningPaceMinPerKm: value }))
        }
      />
      <Field
        label="Grad"
        value={form.city}
        onChange={(value) => setForm((current) => ({ ...current, city: value }))}
      />
      <div className="sm:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Sačuvaj profil
        </button>
        {saved ? <p className="text-sm text-emerald-700">Sačuvano lokalno.</p> : null}
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: Gender | FitnessLevel;
  options: readonly (Gender | FitnessLevel)[];
  onChange: (value: Gender | FitnessLevel) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as Gender | FitnessLevel)}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
