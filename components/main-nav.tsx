import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
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
  { href: "/chat", label: "Moji Treninzi" },
];

export async function MainNav() {
  const user = await getAuthUser();
  const isAuthed = Boolean(user);
  const links = isAuthed ? privateLinks : publicLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-track-soft)] bg-gradient-to-r from-white/95 via-emerald-50/95 to-orange-50/95 shadow-[0_10px_22px_rgba(16,33,43,0.08)] backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 px-4 py-3 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-[var(--color-track-soft)] bg-white px-4 py-1.5 text-[var(--color-ink)] transition hover:border-[var(--color-track)] hover:text-[var(--color-track-strong)]"
          >
            {link.label}
          </Link>
        ))}
        {isAuthed ? <LogoutButton /> : null}
      </nav>
    </header>
  );
}
