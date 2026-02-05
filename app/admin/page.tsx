import { requireAuth } from "@/lib/auth";

const adminTasks = [
  "Pregled korisnika",
  "Izmena statusa korisnika",
  "Uklanjanje lažnih ili problematičnih naloga",
];

export default async function AdminPage() {
  await requireAuth();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Panel</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-600">
          Ova sekcija treba da bude zaštićena ulogom u produkciji.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-800">
          {adminTasks.map((task) => (
            <li key={task}>{task}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
