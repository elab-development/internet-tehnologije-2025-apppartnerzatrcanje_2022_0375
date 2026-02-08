"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardText } from "@/components/ui/card";
import { InputField, SelectField } from "@/components/ui/input-field";

type MyRun = {
  runId: number;
  title: string;
  startsAtIso: string;
  location: {
    city: string;
    municipality: string;
  };
  host: {
    userId: number;
    korisnickoIme: string;
  };
  participantUserIds: number[];
  ratedByCurrentUser: boolean;
};

type ChatMessage = {
  messageId: number;
  content: string;
  sentAtIso: string;
  fromUserId: number;
  fromUsername: string;
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

export function ChatPanel() {
  const [runs, setRuns] = useState<MyRun[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [activeRunId, setActiveRunId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoadingRuns, setIsLoadingRuns] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);
  const [ratingScore, setRatingScore] = useState("5");
  const [ratingComment, setRatingComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const myRuns = useMemo(() => {
    if (currentUserId === null) {
      return [];
    }
    return runs.filter((run) => run.participantUserIds.includes(currentUserId));
  }, [currentUserId, runs]);

  const activeRun = useMemo(() => myRuns.find((run) => run.runId === activeRunId) ?? null, [activeRunId, myRuns]);

  const loadRuns = useCallback(async () => {
    try {
      setIsLoadingRuns(true);
      setErrorMessage(null);

      const response = await fetch("/api/runs", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error?.message ?? "Neuspesno ucitavanje treninga.");
      }

      const fetchedRuns = (payload.data.runs ?? []) as MyRun[];
      const userId = (payload.data.currentUserId ?? null) as number | null;
      const joinedRuns = userId === null ? [] : fetchedRuns.filter((run) => run.participantUserIds.includes(userId));

      setRuns(fetchedRuns);
      setCurrentUserId(userId);
      setActiveRunId((current) => {
        if (current && joinedRuns.some((run) => run.runId === current)) {
          return current;
        }
        return joinedRuns[0]?.runId ?? null;
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Doslo je do greske.");
    } finally {
      setIsLoadingRuns(false);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!activeRunId) {
      setMessages([]);
      return;
    }

    try {
      setIsLoadingMessages(true);
      setErrorMessage(null);

      const response = await fetch(`/api/chat/${activeRunId}/messages`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error?.message ?? "Neuspesno ucitavanje poruka.");
      }

      setMessages((payload.data.messages ?? []) as ChatMessage[]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Doslo je do greske.");
    } finally {
      setIsLoadingMessages(false);
    }
  }, [activeRunId]);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  if (isLoadingRuns) {
    return (
      <Card>
        <CardText>Ucitavanje treninga...</CardText>
      </Card>
    );
  }

  if (myRuns.length === 0) {
    return (
      <Card>
        <CardText>Trenutno nisi clan nijednog treninga.</CardText>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <SelectField
        label="Izaberi trening"
        value={activeRunId ? String(activeRunId) : ""}
        onChange={(event) => setActiveRunId(Number(event.target.value))}
      >
        {myRuns.map((run) => (
          <option key={run.runId} value={run.runId}>
            {run.title}
          </option>
        ))}
      </SelectField>

      {activeRun ? (
        <div className="rounded-xl border border-[var(--color-line)] bg-slate-50 p-3 text-sm text-[var(--color-muted)]">
          <p className="font-medium text-[var(--color-ink)]">{activeRun.title}</p>
          <p>Domacin: {activeRun.host.korisnickoIme}</p>
          <p>
            Lokacija: {activeRun.location.city} ({activeRun.location.municipality})
          </p>
          <p>Pocetak: {formatDateTime(activeRun.startsAtIso)}</p>
        </div>
      ) : null}

      {activeRun && currentUserId !== null && activeRun.host.userId !== currentUserId ? (
        <div className="rounded-xl border border-[var(--color-line)] bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">Ocena kreatora treninga</p>
          {activeRun.ratedByCurrentUser ? (
            <p className="mt-1 text-sm text-[var(--color-muted)]">Vec si ocenio kreatora ovog treninga.</p>
          ) : (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <InputField
                label="Ocena (1-5)"
                type="number"
                min="1"
                max="5"
                step="1"
                value={ratingScore}
                onChange={(event) => setRatingScore(event.target.value)}
                disabled={isSubmittingRating}
              />
              <InputField
                label="Komentar"
                value={ratingComment}
                onChange={(event) => setRatingComment(event.target.value)}
                disabled={isSubmittingRating}
              />
              <div className="sm:col-span-2">
                <Button
                  type="button"
                  disabled={isSubmittingRating}
                  onClick={async () => {
                    try {
                      setIsSubmittingRating(true);
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      const response = await fetch("/api/ratings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          runId: activeRun.runId,
                          score: Number(ratingScore),
                          comment: ratingComment,
                        }),
                      });
                      const payload = await response.json();
                      if (!response.ok || !payload?.success) {
                        throw new Error(payload?.error?.message ?? "Ocena nije uspesno sacuvana.");
                      }
                      setSuccessMessage("Ocena kreatora je uspesno sacuvana.");
                      setRatingComment("");
                      setRatingScore("5");
                      await loadRuns();
                    } catch (error) {
                      setErrorMessage(error instanceof Error ? error.message : "Doslo je do greske.");
                    } finally {
                      setIsSubmittingRating(false);
                    }
                  }}
                >
                  {isSubmittingRating ? "Slanje..." : "Oceni kreatora"}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{errorMessage}</div>
      ) : null}

      <ul className="space-y-3">
        {isLoadingMessages ? (
          <li className="rounded-xl border border-[var(--color-line)] bg-white p-3 text-sm text-[var(--color-muted)]">
            Ucitavanje poruka...
          </li>
        ) : null}

        {!isLoadingMessages &&
          messages.map((message) => (
            <li key={message.messageId} className="rounded-xl border border-[var(--color-line)] bg-white p-3">
              <p className="text-sm font-semibold text-[var(--color-ink)]">{message.fromUsername}</p>
              {editingMessageId === message.messageId ? (
                <div className="mt-2 space-y-2">
                  <InputField
                    label="Izmeni poruku"
                    value={editingContent}
                    onChange={(event) => setEditingContent(event.target.value)}
                    disabled={isEditingMessage}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      disabled={isEditingMessage}
                      onClick={async () => {
                        if (!activeRunId) {
                          return;
                        }
                        try {
                          setIsEditingMessage(true);
                          setErrorMessage(null);
                          const response = await fetch(`/api/chat/${activeRunId}/messages/${message.messageId}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ content: editingContent }),
                          });
                          const payload = await response.json();
                          if (!response.ok || !payload?.success) {
                            const fieldErrors = payload?.error?.details?.fieldErrors as
                              | Record<string, string[] | undefined>
                              | undefined;
                            const firstFieldError = fieldErrors
                              ? Object.values(fieldErrors).find((list) => Array.isArray(list) && list.length > 0)?.[0]
                              : undefined;
                            throw new Error(firstFieldError ?? payload?.error?.message ?? "Izmena poruke nije uspela.");
                          }
                          setEditingMessageId(null);
                          setEditingContent("");
                          await loadMessages();
                        } catch (error) {
                          setErrorMessage(error instanceof Error ? error.message : "Doslo je do greske.");
                        } finally {
                          setIsEditingMessage(false);
                        }
                      }}
                    >
                      {isEditingMessage ? "Cuvanje..." : "Sacuvaj"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isEditingMessage}
                      onClick={() => {
                        setEditingMessageId(null);
                        setEditingContent("");
                      }}
                    >
                      Otkazi
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{message.content}</p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {formatDateTime(message.sentAtIso)}
                  </p>
                </>
              )}
              {currentUserId === message.fromUserId && editingMessageId !== message.messageId ? (
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingMessageId(message.messageId);
                      setEditingContent(message.content);
                    }}
                  >
                    Izmeni
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    disabled={deletingMessageId === message.messageId}
                    onClick={async () => {
                      if (!activeRunId) {
                        return;
                      }
                      try {
                        setDeletingMessageId(message.messageId);
                        setErrorMessage(null);
                        const response = await fetch(`/api/chat/${activeRunId}/messages/${message.messageId}`, {
                          method: "DELETE",
                        });
                        const payload = await response.json();
                        if (!response.ok || !payload?.success) {
                          throw new Error(payload?.error?.message ?? "Brisanje poruke nije uspelo.");
                        }
                        await loadMessages();
                      } catch (error) {
                        setErrorMessage(error instanceof Error ? error.message : "Doslo je do greske.");
                      } finally {
                        setDeletingMessageId(null);
                      }
                    }}
                  >
                    {deletingMessageId === message.messageId ? "Brisanje..." : "Obrisi"}
                  </Button>
                </div>
              ) : null}
            </li>
          ))}

        {!isLoadingMessages && messages.length === 0 ? (
          <li className="rounded-xl border border-[var(--color-line)] bg-white p-3 text-sm text-[var(--color-muted)]">
            Jos nema poruka u ovoj grupi.
          </li>
        ) : null}
      </ul>

      <form
        className="flex gap-2"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!activeRunId || !draft.trim()) {
            return;
          }

          try {
            setIsSending(true);
            setErrorMessage(null);

            const response = await fetch(`/api/chat/${activeRunId}/messages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ content: draft }),
            });
            const payload = await response.json();
            if (!response.ok || !payload?.success) {
              const fieldErrors = payload?.error?.details?.fieldErrors as Record<string, string[] | undefined> | undefined;
              const firstFieldError = fieldErrors
                ? Object.values(fieldErrors).find((list) => Array.isArray(list) && list.length > 0)?.[0]
                : undefined;
              throw new Error(firstFieldError ?? payload?.error?.message ?? "Neuspesno slanje poruke.");
            }

            setDraft("");
            await loadMessages();
          } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Doslo je do greske.");
          } finally {
            setIsSending(false);
          }
        }}
      >
        <InputField
          label="Poruka grupi"
          value={draft}
          placeholder="Unesi poruku za grupu treninga..."
          onChange={(event) => setDraft(event.target.value)}
          disabled={isSending}
        />
        <div className="pt-[22px]">
          <Button type="submit" disabled={isSending}>
            {isSending ? "Slanje..." : "Posalji"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
