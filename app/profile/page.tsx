import { ProfileForm } from "@/components/profile-form";
import { requireAuth } from "@/lib/auth";

export default async function ProfilePage() {
  await requireAuth();

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Moj Profil</h1>
      <p className="text-sm text-[var(--color-muted)]">Azuriraj svoje nalog podatke i tempo trcanja.</p>
      <ProfileForm />
    </section>
  );
}
