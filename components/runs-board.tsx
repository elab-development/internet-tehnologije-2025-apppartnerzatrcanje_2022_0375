"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { InputField } from "@/components/ui/input-field";

type RunItem = {
  runId: number;
  title: string;
  route: string;
  startsAtIso: string;
  distanceKm: number;
  paceMinPerKm: number;
  location: {
    locationId: number;
    city: string;
    municipality: string;
  };
  host: {
    userId: number;
    korisnickoIme: string;
  };
  participantUserIds: number[];
};

export function RunsBoard() {
  const [query, setQuery] = useState("");
  const [maxPace, setMaxPace] = useState("7");
  const [runs, setRuns] = useState<RunItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingRunId, setIsSubmittingRunId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (query.trim().length > 0) {
      params.set("q", query.trim());
    }
    if (maxPace.trim().length > 0) {
      params.set("maxPace", maxPace.trim());
    }
    return params.toString();
  }, [maxPace, query]);

  const loadRuns = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await fetch(`/api/runs${queryString ? `?${queryString}` : ""}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error?.message ?? "Neuspesno ucitavanje treninga.");
      }

      setRuns(payload.data.runs ?? []);
      setCurrentUserId(payload.data.currentUserId ?? null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Doslo je do greske.");
    } finally {
      setIsLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

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

      {errorMessage ? (
        <Card>
          <CardText className="text-rose-700">{errorMessage}</CardText>
        </Card>
      ) : null}
      {successMessage ? (
        <Card>
          <CardText className="text-[var(--color-track-strong)]">{successMessage}</CardText>
        </Card>
      ) : null}

      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardText>Ucitavanje treninga...</CardText>
          </Card>
        ) : null}

        {!isLoading
          ? runs.map((run) => {
              const isJoined = currentUserId !== null && run.participantUserIds.includes(currentUserId);

              return (
                <Card key={run.runId}>
                  <CardTitle>{run.title}</CardTitle>
                  <CardText className="mt-1">Ruta: {run.route}</CardText>
                  <CardText>Domacin: {run.host.korisnickoIme}</CardText>
                  <CardText>
                    Grad: {run.location.city} ({run.location.municipality})
                  </CardText>
                  <CardText>Duzina: {run.distanceKm} km</CardText>
                  <CardText>Tempo: {run.paceMinPerKm} min/km</CardText>
                  <CardText>Pocetak: {new Date(run.startsAtIso).toLocaleString()}</CardText>
                  <div className="mt-3">
                    <Button
                      variant="secondary"
                      disabled={isSubmittingRunId === run.runId}
                      onClick={async () => {
                        try {
                          setIsSubmittingRunId(run.runId);
                          setErrorMessage(null);
                          setSuccessMessage(null);

                          const endpoint = isJoined ? "leave" : "join";
                          const response = await fetch(`/api/runs/${run.runId}/${endpoint}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                          });
                          const payload = await response.json();

                          if (!response.ok || !payload?.success) {
                            throw new Error(payload?.error?.message ?? "Promena prijave nije uspela.");
                          }

                          setSuccessMessage(
                            isJoined ? "Uspesno ste se odjavili sa treninga." : "Uspesno ste prijavljeni na trening."
                          );
                          await loadRuns();
                        } catch (error) {
                          setErrorMessage(error instanceof Error ? error.message : "Doslo je do greske.");
                        } finally {
                          setIsSubmittingRunId(null);
                        }
                      }}
                    >
                      {isSubmittingRunId === run.runId
                        ? "Obrada..."
                        : isJoined
                          ? "Odjavi se sa treninga"
                          : "Prijavi se na trening"}
                    </Button>
                  </div>
                </Card>
              );
            })
          : null}

        {!isLoading && runs.length === 0 ? (
          <Card>
            <CardText>Nema treninga za izabrane filtere.</CardText>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
