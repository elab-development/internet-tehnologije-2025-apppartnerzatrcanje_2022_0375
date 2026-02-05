import { RatingsBoard } from "@/components/ratings-board";
import { requireAuth } from "@/lib/auth";

export default async function RatingsPage() {
  await requireAuth();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Ocene</h1>
      <p className="text-sm text-slate-600">Lista i forma za unos su frontend test prikaz.</p>
      <RatingsBoard />
    </section>
  );
}
