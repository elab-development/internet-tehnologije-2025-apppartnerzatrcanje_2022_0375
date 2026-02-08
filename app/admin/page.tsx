import { AdminDashboard } from "@/components/admin-dashboard";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Admin Panel</h1>
      <p className="text-sm text-[var(--color-muted)]">Pregled i moderacija korisnika i treninga.</p>
      <AdminDashboard />
    </section>
  );
}
