"use client";

import { useState } from "react";
import { locations, messages, runs, users } from "@/lib/mock-data";

const CURRENT_USER_ID = "u1";

export function ChatPanel() {
  const myRuns = runs.filter((run) => run.participantUserIds.includes(CURRENT_USER_ID));
  const [activeRunId, setActiveRunId] = useState(myRuns[0]?.runId ?? "");
  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] = useState(messages);

  const activeRun = myRuns.find((run) => run.runId === activeRunId);
  const activeLocation = locations.find((location) => location.locationId === activeRun?.locationId);

  const groupMessages = localMessages
    .filter((message) => message.runId === activeRunId)
    .map((message) => ({
      ...message,
      from: users.find((user) => user.userId === message.fromUserId)?.username ?? "Nepoznato",
    }))
    .sort((a, b) => a.sentAtIso.localeCompare(b.sentAtIso));

  if (!myRuns.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Trenutno nisi član nijednog treninga.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <label className="block">
        <span className="text-xs uppercase tracking-wide text-slate-500">Izaberi trening</span>
        <select
          value={activeRunId}
          onChange={(event) => setActiveRunId(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
        >
          {myRuns.map((run) => (
            <option key={run.runId} value={run.runId}>
              {run.title}
            </option>
          ))}
        </select>
      </label>

      {activeRun ? (
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
          <p className="font-medium">{activeRun.title}</p>
          <p>
            Lokacija: {activeLocation?.city} ({activeLocation?.municipality})
          </p>
          <p>Početak: {new Date(activeRun.startsAtIso).toLocaleString()}</p>
        </div>
      ) : null}

      <ul className="space-y-3">
        {groupMessages.map((message) => (
          <li key={message.messageId} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-sm font-medium">{message.from}</p>
            <p className="mt-1 text-sm text-slate-700">{message.content}</p>
          </li>
        ))}
        {groupMessages.length === 0 ? (
          <li className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
            Još nema poruka u ovoj grupi.
          </li>
        ) : null}
      </ul>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim() || !activeRunId) return;

          const recipientId =
            activeRun?.participantUserIds.find((userId) => userId !== CURRENT_USER_ID) ?? "u2";

          setLocalMessages((current) => [
            ...current,
            {
              messageId: `m-${Date.now()}`,
              fromUserId: CURRENT_USER_ID,
              toUserId: recipientId,
              runId: activeRunId,
              content: draft.trim(),
              sentAtIso: new Date().toISOString(),
            },
          ]);
          setDraft("");
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Unesi poruku za grupu treninga..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
        />
        <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          Pošalji
        </button>
      </form>
    </div>
  );
}
