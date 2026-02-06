"use client";

import { useState } from "react";
import { locations, messages, runs, users } from "@/lib/mock-data";
import { Card, CardText } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputField, SelectField } from "@/components/ui/input-field";

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
      <Card>
        <CardText>Trenutno nisi član nijednog treninga.</CardText>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <SelectField
        label="Izaberi trening"
        value={activeRunId}
        onChange={(event) => setActiveRunId(event.target.value)}
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
          <p>
            Lokacija: {activeLocation?.city} ({activeLocation?.municipality})
          </p>
          <p>Početak: {new Date(activeRun.startsAtIso).toLocaleString()}</p>
        </div>
      ) : null}

      <ul className="space-y-3">
        {groupMessages.map((message) => (
          <li key={message.messageId} className="rounded-xl border border-[var(--color-line)] bg-white p-3">
            <p className="text-sm font-semibold text-[var(--color-ink)]">{message.from}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{message.content}</p>
          </li>
        ))}
        {groupMessages.length === 0 ? (
          <li className="rounded-xl border border-[var(--color-line)] bg-white p-3 text-sm text-[var(--color-muted)]">
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
        <InputField
          label="Poruka grupi"
          value={draft}
          placeholder="Unesi poruku za grupu treninga..."
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className="pt-[22px]">
          <Button type="submit">Pošalji</Button>
        </div>
      </form>
    </Card>
  );
}
