"use client";

import { useMemo, useState } from "react";
import { locations, runs, users } from "@/lib/mock-data";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";

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
      <Card className="grid gap-3 sm:grid-cols-2">
        <InputField
          label="Pretraga"
          value={query}
          placeholder="Ruta, grad, naziv..."
          onChange={(event) => setQuery(event.target.value)}
        />
        <InputField
          label="Maks tempo (min/km)"
          type="number"
          step="0.1"
          value={maxPace}
          onChange={(event) => setMaxPace(event.target.value)}
        />
      </Card>

      <div className="space-y-3">
        {filtered.map((run) => {
          const host = users.find((user) => user.userId === run.hostUserId);
          const location = locations.find((loc) => loc.locationId === run.locationId);

          return (
            <Card key={run.runId}>
              <CardTitle>{run.title}</CardTitle>
              <CardText className="mt-1">Ruta: {run.route}</CardText>
              <CardText>Domaćin: {host?.username}</CardText>
              <CardText>
                Grad: {location?.city} ({location?.municipality})
              </CardText>
              <CardText>Dužina: {run.distanceKm} km</CardText>
              <CardText>Tempo: {run.paceMinPerKm} min/km</CardText>
              <CardText>Početak: {new Date(run.startsAtIso).toLocaleString()}</CardText>
              <div className="mt-3">
                <Button variant="secondary">Prijavi se na trening</Button>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 ? (
          <Card>
            <CardText>Nema treninga za izabrane filtere.</CardText>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
