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

type CreateRunForm = {
  title: string;
  route: string;
  startsAtLocal: string;
  distanceKm: string;
  paceMinPerKm: string;
  city: string;
  municipality: string;
};

function formatDateTime(value: string) {
  const date = new Date(value);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export function RunsBoard() {
  const [query, setQuery] = useState("");
  const [maxPace, setMaxPace] = useState("7");
  const [runs, setRuns] = useState<RunItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingRunId, setIsSubmittingRunId] = useState<number | null>(null);
  const [isDeletingRunId, setIsDeletingRunId] = useState<number | null>(null);
  const [editingRunId, setEditingRunId] = useState<number | null>(null);
  const [isUpdatingRun, setIsUpdatingRun] = useState(false);
  const [isCreatingRun, setIsCreatingRun] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateRunForm>({
    title: "",
    route: "",
    startsAtLocal: "",
    distanceKm: "",
    paceMinPerKm: "",
    city: "",
    municipality: "",
  });
  const [editForm, setEditForm] = useState<CreateRunForm>({
    title: "",
    route: "",
    startsAtLocal: "",
    distanceKm: "",
    paceMinPerKm: "",
    city: "",
    municipality: "",
  });

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
      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Kreiraj trening</h2>
        <form
          className="mt-3 grid gap-3 sm:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            setErrorMessage(null);
            setSuccessMessage(null);

            try {
              setIsCreatingRun(true);
              if (!createForm.startsAtLocal) {
                throw new Error("Unesi datum i vreme pocetka treninga.");
              }
              const startsAtDate = new Date(createForm.startsAtLocal);
              if (Number.isNaN(startsAtDate.getTime())) {
                throw new Error("Datum i vreme pocetka nisu validni.");
              }
              const startsAtIso = startsAtDate.toISOString();

              const response = await fetch("/api/runs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: createForm.title,
                  route: createForm.route,
                  startsAtIso,
                  distanceKm: Number(createForm.distanceKm),
                  paceMinPerKm: Number(createForm.paceMinPerKm),
                  city: createForm.city,
                  municipality: createForm.municipality,
                }),
              });
              const payload = await response.json();

              if (!response.ok || !payload?.success) {
                const fieldErrors = payload?.error?.details?.fieldErrors as
                  | Record<string, string[] | undefined>
                  | undefined;
                const firstFieldError = fieldErrors
                  ? Object.values(fieldErrors).find((messages) => Array.isArray(messages) && messages.length > 0)?.[0]
                  : undefined;

                throw new Error(firstFieldError ?? payload?.error?.message ?? "Neuspesno kreiranje treninga.");
              }

              setCreateForm({
                title: "",
                route: "",
                startsAtLocal: "",
                distanceKm: "",
                paceMinPerKm: "",
                city: "",
                municipality: "",
              });
              setSuccessMessage("Trening je uspesno kreiran.");
              await loadRuns();
            } catch (error) {
              setErrorMessage(error instanceof Error ? error.message : "Doslo je do greske.");
            } finally {
              setIsCreatingRun(false);
            }
          }}
        >
          <InputField
            label="Naziv treninga"
            value={createForm.title}
            onChange={(event) => setCreateForm((current) => ({ ...current, title: event.target.value }))}
            disabled={isCreatingRun}
          />
          <InputField
            label="Ruta"
            value={createForm.route}
            onChange={(event) => setCreateForm((current) => ({ ...current, route: event.target.value }))}
            disabled={isCreatingRun}
          />
          <InputField
            label="Pocetak"
            type="datetime-local"
            value={createForm.startsAtLocal}
            onChange={(event) => setCreateForm((current) => ({ ...current, startsAtLocal: event.target.value }))}
            disabled={isCreatingRun}
          />
          <InputField
            label="Duzina (km)"
            type="number"
            step="0.1"
            value={createForm.distanceKm}
            onChange={(event) => setCreateForm((current) => ({ ...current, distanceKm: event.target.value }))}
            disabled={isCreatingRun}
          />
          <InputField
            label="Tempo (min/km)"
            type="number"
            step="0.1"
            value={createForm.paceMinPerKm}
            onChange={(event) => setCreateForm((current) => ({ ...current, paceMinPerKm: event.target.value }))}
            disabled={isCreatingRun}
          />
          <InputField
            label="Grad"
            value={createForm.city}
            onChange={(event) => setCreateForm((current) => ({ ...current, city: event.target.value }))}
            disabled={isCreatingRun}
          />
          <InputField
            label="Opstina"
            value={createForm.municipality}
            onChange={(event) => setCreateForm((current) => ({ ...current, municipality: event.target.value }))}
            disabled={isCreatingRun}
          />
          <div className="sm:col-span-2">
            <Button type="submit" disabled={isCreatingRun}>
              {isCreatingRun ? "Kreiranje..." : "Kreiraj trening"}
            </Button>
          </div>
        </form>
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
              const isCreator = currentUserId !== null && run.host.userId === currentUserId;
              const isEditingThisRun = editingRunId === run.runId;

              return (
                <Card key={run.runId}>
                  {isEditingThisRun ? (
                    <form
                      className="grid gap-3 sm:grid-cols-2"
                      onSubmit={async (event) => {
                        event.preventDefault();
                        try {
                          setIsUpdatingRun(true);
                          setErrorMessage(null);
                          setSuccessMessage(null);
                          if (!editForm.startsAtLocal) {
                            throw new Error("Unesi datum i vreme pocetka treninga.");
                          }
                          const startsAtDate = new Date(editForm.startsAtLocal);
                          if (Number.isNaN(startsAtDate.getTime())) {
                            throw new Error("Datum i vreme pocetka nisu validni.");
                          }

                          const response = await fetch(`/api/runs/${run.runId}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              title: editForm.title,
                              route: editForm.route,
                              startsAtIso: startsAtDate.toISOString(),
                              distanceKm: Number(editForm.distanceKm),
                              paceMinPerKm: Number(editForm.paceMinPerKm),
                              city: editForm.city,
                              municipality: editForm.municipality,
                            }),
                          });
                          const payload = await response.json();
                          if (!response.ok || !payload?.success) {
                            const fieldErrors = payload?.error?.details?.fieldErrors as
                              | Record<string, string[] | undefined>
                              | undefined;
                            const firstFieldError = fieldErrors
                              ? Object.values(fieldErrors).find((messages) => Array.isArray(messages) && messages.length > 0)?.[0]
                              : undefined;
                            throw new Error(firstFieldError ?? payload?.error?.message ?? "Izmena treninga nije uspela.");
                          }

                          setEditingRunId(null);
                          setSuccessMessage("Trening je uspesno izmenjen.");
                          await loadRuns();
                        } catch (error) {
                          setErrorMessage(error instanceof Error ? error.message : "Doslo je do greske.");
                        } finally {
                          setIsUpdatingRun(false);
                        }
                      }}
                    >
                      <InputField
                        label="Naziv treninga"
                        value={editForm.title}
                        onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
                        disabled={isUpdatingRun}
                      />
                      <InputField
                        label="Ruta"
                        value={editForm.route}
                        onChange={(event) => setEditForm((current) => ({ ...current, route: event.target.value }))}
                        disabled={isUpdatingRun}
                      />
                      <InputField
                        label="Pocetak"
                        type="datetime-local"
                        value={editForm.startsAtLocal}
                        onChange={(event) => setEditForm((current) => ({ ...current, startsAtLocal: event.target.value }))}
                        disabled={isUpdatingRun}
                      />
                      <InputField
                        label="Duzina (km)"
                        type="number"
                        step="0.1"
                        value={editForm.distanceKm}
                        onChange={(event) => setEditForm((current) => ({ ...current, distanceKm: event.target.value }))}
                        disabled={isUpdatingRun}
                      />
                      <InputField
                        label="Tempo (min/km)"
                        type="number"
                        step="0.1"
                        value={editForm.paceMinPerKm}
                        onChange={(event) => setEditForm((current) => ({ ...current, paceMinPerKm: event.target.value }))}
                        disabled={isUpdatingRun}
                      />
                      <InputField
                        label="Grad"
                        value={editForm.city}
                        onChange={(event) => setEditForm((current) => ({ ...current, city: event.target.value }))}
                        disabled={isUpdatingRun}
                      />
                      <InputField
                        label="Opstina"
                        value={editForm.municipality}
                        onChange={(event) => setEditForm((current) => ({ ...current, municipality: event.target.value }))}
                        disabled={isUpdatingRun}
                      />
                      <div className="flex gap-2 sm:col-span-2">
                        <Button type="submit" disabled={isUpdatingRun}>
                          {isUpdatingRun ? "Cuvanje..." : "Sacuvaj izmene"}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={isUpdatingRun}
                          onClick={() => setEditingRunId(null)}
                        >
                          Otkazi
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <CardTitle>{run.title}</CardTitle>
                      <CardText className="mt-1">Ruta: {run.route}</CardText>
                      <CardText>Domacin: {run.host.korisnickoIme}</CardText>
                      <CardText>
                        Grad: {run.location.city} ({run.location.municipality})
                      </CardText>
                      <CardText>Duzina: {run.distanceKm} km</CardText>
                      <CardText>Tempo: {run.paceMinPerKm} min/km</CardText>
                      <CardText>Pocetak: {formatDateTime(run.startsAtIso)}</CardText>
                      <div className="mt-3 flex flex-wrap gap-2">
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
                        {isCreator ? (
                          <>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => {
                                const startsAt = new Date(run.startsAtIso);
                                const localValue = `${startsAt.getFullYear()}-${String(startsAt.getMonth() + 1).padStart(2, "0")}-${String(startsAt.getDate()).padStart(2, "0")}T${String(startsAt.getHours()).padStart(2, "0")}:${String(startsAt.getMinutes()).padStart(2, "0")}`;
                                setEditForm({
                                  title: run.title,
                                  route: run.route,
                                  startsAtLocal: localValue,
                                  distanceKm: String(run.distanceKm),
                                  paceMinPerKm: String(run.paceMinPerKm),
                                  city: run.location.city,
                                  municipality: run.location.municipality,
                                });
                                setEditingRunId(run.runId);
                              }}
                            >
                              Izmeni trening
                            </Button>
                            <Button
                              type="button"
                              variant="danger"
                              disabled={isDeletingRunId === run.runId}
                              onClick={async () => {
                                try {
                                  setIsDeletingRunId(run.runId);
                                  setErrorMessage(null);
                                  setSuccessMessage(null);
                                  const response = await fetch(`/api/runs/${run.runId}`, { method: "DELETE" });
                                  const payload = await response.json();
                                  if (!response.ok || !payload?.success) {
                                    throw new Error(payload?.error?.message ?? "Brisanje treninga nije uspelo.");
                                  }
                                  setSuccessMessage("Trening je uspesno obrisan.");
                                  await loadRuns();
                                } catch (error) {
                                  setErrorMessage(error instanceof Error ? error.message : "Doslo je do greske.");
                                } finally {
                                  setIsDeletingRunId(null);
                                }
                              }}
                            >
                              {isDeletingRunId === run.runId ? "Brisanje..." : "Obrisi trening"}
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </>
                  )}
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
