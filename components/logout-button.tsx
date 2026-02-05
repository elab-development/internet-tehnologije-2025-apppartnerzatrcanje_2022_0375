"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        document.cookie = "runly_auth=; path=/; max-age=0; samesite=lax";
        router.push("/login");
        router.refresh();
      }}
      className="rounded-full border border-rose-300 px-3 py-1.5 text-rose-700 transition hover:bg-rose-50"
      type="button"
    >
      Odjava
    </button>
  );
}
