import { ChatPanel } from "@/components/chat-panel";
import { requireAuth } from "@/lib/auth";

export default async function ChatPage() {
  await requireAuth();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Moji Treninzi</h1>
      <p className="text-sm text-slate-600">
        Pregled treninga u kojima učestvuješ i grupni chat za svaki trening.
      </p>
      <ChatPanel />
    </section>
  );
}
