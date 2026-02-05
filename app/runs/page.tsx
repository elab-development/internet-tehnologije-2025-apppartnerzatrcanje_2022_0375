import { RunsBoard } from "@/components/runs-board";
import { requireAuth } from "@/lib/auth";

export default async function RunsPage() {
  await requireAuth();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Treninzi</h1>
      <p className="text-sm text-slate-600">Pretraga i filter rade nad test podacima u frontendu.</p>
      <RunsBoard />
    </section>
  );
}
