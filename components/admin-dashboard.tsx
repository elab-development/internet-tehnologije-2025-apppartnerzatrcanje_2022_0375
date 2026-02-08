"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";

type AdminUser = {
  userId: number;
  email: string;
  korisnickoIme: string;
  role: string;
  createdAtIso: string;
  hostedRunsCount: number;
  joinedRunsCount: number;
  isCurrentAdmin: boolean;
};

type AdminRun = {
  runId: number;
  title: string;
  startsAtIso: string;
  hostUserId: number;
  hostUsername: string;
  city: string;
  municipality: string;
  participantsCount: number;
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

export function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [runs, setRuns] = useState<AdminRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [deletingRunId, setDeletingRunId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadAdminData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const [usersRes, runsRes] = await Promise.all([
        fetch("/api/admin/users", { cache: "no-store" }),
        fetch("/api/admin/runs", { cache: "no-store" }),
      ]);

      const usersPayload = await usersRes.json();
      const runsPayload = await runsRes.json();
      if (!usersRes.ok || !usersPayload?.success) {
        throw new Error(usersPayload?.error?.message ?? "Neuspesno ucitavanje korisnika.");
      }
      if (!runsRes.ok || !runsPayload?.success) {
        throw new Error(runsPayload?.error?.message ?? "Neuspesno ucitavanje treninga.");
      }

      setUsers(usersPayload.data.users ?? []);
      setRuns(runsPayload.data.runs ?? []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Doslo je do greske.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  return (
    <div className="space-y-4">
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

      <Card>
        <CardTitle>Korisnici</CardTitle>
        {isLoading ? (
          <CardText className="mt-2">Ucitavanje...</CardText>
        ) : (
          <div className="mt-3 space-y-2">
            {users.map((user) => (
              <div key={user.userId} className="rounded-xl border border-[var(--color-line)] p-3">
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  {user.korisnickoIme} ({user.role})
                </p>
                <p className="text-sm text-[var(--color-muted)]">{user.email}</p>
                <p className="text-xs text-[var(--color-muted)]">Kreiran: {formatDateTime(user.createdAtIso)}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  Kreirao treninga: {user.hostedRunsCount} | Ucesca: {user.joinedRunsCount}
                </p>
                {!user.isCurrentAdmin ? (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="danger"
                      disabled={deletingUserId === user.userId}
                      onClick={async () => {
                        try {
                          setDeletingUserId(user.userId);
                          setErrorMessage(null);
                          setSuccessMessage(null);
                          const response = await fetch(`/api/admin/users/${user.userId}`, { method: "DELETE" });
                          const payload = await response.json();
                          if (!response.ok || !payload?.success) {
                            throw new Error(payload?.error?.message ?? "Brisanje korisnika nije uspelo.");
                          }
                          setSuccessMessage("Korisnik je obrisan.");
                          await loadAdminData();
                        } catch (error) {
                          setErrorMessage(error instanceof Error ? error.message : "Doslo je do greske.");
                        } finally {
                          setDeletingUserId(null);
                        }
                      }}
                    >
                      {deletingUserId === user.userId ? "Brisanje..." : "Obrisi korisnika"}
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
            {users.length === 0 ? <CardText>Nema korisnika.</CardText> : null}
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>Treninzi</CardTitle>
        {isLoading ? (
          <CardText className="mt-2">Ucitavanje...</CardText>
        ) : (
          <div className="mt-3 space-y-2">
            {runs.map((run) => (
              <div key={run.runId} className="rounded-xl border border-[var(--color-line)] p-3">
                <p className="text-sm font-semibold text-[var(--color-ink)]">{run.title}</p>
                <p className="text-sm text-[var(--color-muted)]">Domacin: {run.hostUsername}</p>
                <p className="text-sm text-[var(--color-muted)]">
                  Lokacija: {run.city} ({run.municipality})
                </p>
                <p className="text-xs text-[var(--color-muted)]">Pocetak: {formatDateTime(run.startsAtIso)}</p>
                <p className="text-xs text-[var(--color-muted)]">Broj ucesnika: {run.participantsCount}</p>
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="danger"
                    disabled={deletingRunId === run.runId}
                    onClick={async () => {
                      try {
                        setDeletingRunId(run.runId);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                        const response = await fetch(`/api/admin/runs/${run.runId}`, { method: "DELETE" });
                        const payload = await response.json();
                        if (!response.ok || !payload?.success) {
                          throw new Error(payload?.error?.message ?? "Brisanje treninga nije uspelo.");
                        }
                        setSuccessMessage("Trening je obrisan.");
                        await loadAdminData();
                      } catch (error) {
                        setErrorMessage(error instanceof Error ? error.message : "Doslo je do greske.");
                      } finally {
                        setDeletingRunId(null);
                      }
                    }}
                  >
                    {deletingRunId === run.runId ? "Brisanje..." : "Obrisi trening"}
                  </Button>
                </div>
              </div>
            ))}
            {runs.length === 0 ? <CardText>Nema treninga.</CardText> : null}
          </div>
        )}
      </Card>
    </div>
  );
}
