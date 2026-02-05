import Link from "next/link";
import { cookies } from "next/headers";
import { LogoutButton } from "@/components/logout-button";

const publicLinks = [
  { href: "/", label: "Runly" },
  { href: "/login", label: "Prijava" },
  { href: "/register", label: "Registracija" },
];

const privateLinks = [
  { href: "/main", label: "Glavna" },
  { href: "/profile", label: "Profil" },
  { href: "/runs", label: "Treninzi" },
  { href: "/map", label: "Mapa" },
  { href: "/chat", label: "Moji Treninzi" },
  { href: "/ratings", label: "Ocene" },
];

export async function MainNav() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("runly_auth")?.value === "1";
  const links = isAuthed ? privateLinks : publicLinks;

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700"
          >
            {link.label}
          </Link>
        ))}
        {isAuthed ? <LogoutButton /> : null}
      </nav>
    </header>
  );
}
