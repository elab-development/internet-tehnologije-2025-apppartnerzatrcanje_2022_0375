"use client";

import { useMemo, useState } from "react";
import { locations, runs, users } from "@/lib/mock-data";

export function RunsBoard() {
  const [query, setQuery] = useState("");
  const [maxPace, setMaxPace] = useState("7");

  const filtered = useMemo(() => {
    const paceLimit = Number(maxPace);
    return runs.filter((run) => {
      const location = locations.find((loc) => loc.locationId === run.locationId);
      const searchable = `${run.title} ${run.route} ${location?.city ?? ""} ${location?.municipality ?? ""}`.toLowerCase();
      const matchesQuery = searchable.includes(query.toLowerCase().trim());
      const matchesPace = run.paceMinPerKm <= paceLimit;
      return matchesQuery && matchesPace;
    });
  }, [maxPace, query]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-slate-500">Pretraga</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ruta, grad, naziv..."
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-slate-500">Maks tempo (min/km)</span>
          <input
            type="number"
            step="0.1"
            value={maxPace}
            onChange={(event) => setMaxPace(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          />
        </label>
      </div>

      <div className="space-y-3">
        {filtered.map((run) => {
          const host = users.find((user) => user.userId === run.hostUserId);
          const location = locations.find((loc) => loc.locationId === run.locationId);

          return (
            <article key={run.runId} className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold">{run.title}</h2>
              <p className="mt-1 text-sm text-slate-600">Ruta: {run.route}</p>
              <p className="text-sm text-slate-600">Domaćin: {host?.username}</p>
              <p className="text-sm text-slate-600">
                Grad: {location?.city} ({location?.municipality})
              </p>
              <p className="text-sm text-slate-600">Dužina: {run.distanceKm} km</p>
              <p className="text-sm text-slate-600">Tempo: {run.paceMinPerKm} min/km</p>
              <p className="text-sm text-slate-600">
                Početak: {new Date(run.startsAtIso).toLocaleString()}
              </p>
              <button className="mt-3 rounded-md border border-emerald-500 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
                Prijavi se na trening
              </button>
            </article>
          );
        })}
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            Nema treninga za izabrane filtere.
          </p>
        ) : null}
      </div>
    </div>
  );
}
