import { RunsBoard } from "@/components/runs-board";
import { requireAuth } from "@/lib/auth";

export default async function RunsPage() {
  await requireAuth();

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Treninzi</h1>
      <p className="text-sm text-[var(--color-muted)]">Pretrazi treninge i prijavi se ili odjavi direktno iz baze.</p>
      <RunsBoard />
    </section>
  );
}
