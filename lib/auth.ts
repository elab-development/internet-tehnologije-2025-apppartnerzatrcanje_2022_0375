import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("runly_auth")?.value === "1";

  if (!isAuthed) {
    redirect("/login");
  }
}
