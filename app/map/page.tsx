import { requireAuth } from "@/lib/auth";
import { locations } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";

export default async function MapPage() {
  await requireAuth();

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Mapa u Blizini</h1>
      <Card>
        <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-[var(--color-line)] bg-slate-50">
          <p className="text-sm text-[var(--color-muted)]">
            Mesto za interaktivnu mapu (moguća integracija Leaflet/Mapbox).
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Poznate Lokacije</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
          {locations.map((location) => (
            <li key={location.locationId}>
              {location.city} - {location.municipality}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
