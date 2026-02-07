import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/card";

const adminTasks = [
  "Pregled korisnika",
  "Izmena statusa korisnika",
  "Uklanjanje lažnih ili problematičnih naloga",
];

export default async function AdminPage() {
  await requireAdmin();

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Admin Panel</h1>
      <Card>
        <p className="text-sm text-[var(--color-muted)]">
          Ova sekcija treba da bude zaštićena ulogom u produkciji.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[var(--color-ink)]">
          {adminTasks.map((task) => (
            <li key={task}>{task}</li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
