import { requireAuth } from "@/lib/auth";
import { locations } from "@/lib/mock-data";

export default async function MapPage() {
  await requireAuth();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Mapa u Blizini</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
          <p className="text-sm text-slate-500">
            Mesto za interaktivnu mapu (moguća integracija Leaflet/Mapbox).
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-medium">Poznate Lokacije</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {locations.map((location) => (
            <li key={location.locationId}>
              {location.city} - {location.municipality}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
