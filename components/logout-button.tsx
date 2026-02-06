"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  return (
    <Button
      variant="danger"
      type="button"
      onClick={() => {
        document.cookie = "runly_auth=; path=/; max-age=0; samesite=lax";
        router.push("/login");
        router.refresh();
      }}
    >
      Odjava
    </Button>
  );
}
