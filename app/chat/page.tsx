import { ChatPanel } from "@/components/chat-panel";
import { requireAuth } from "@/lib/auth";

export default async function ChatPage() {
  await requireAuth();

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Moji Treninzi</h1>
      <p className="text-sm text-[var(--color-muted)]">
        Pregled treninga u kojima učestvuješ i grupni chat za svaki trening.
      </p>
      <ChatPanel />
    </section>
  );
}
