import { ProfileForm } from "@/components/profile-form";
import { requireAuth } from "@/lib/auth";

export default async function ProfilePage() {
  await requireAuth();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Moj Profil</h1>
      <p className="text-sm text-slate-600">Za sada je ovo samo frontend forma.</p>
      <ProfileForm />
    </section>
  );
}
