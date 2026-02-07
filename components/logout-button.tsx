"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onLogout() {
    setIsSubmitting(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
      setIsSubmitting(false);
    }
  }

  return (
    <Button
      variant="danger"
      type="button"
      disabled={isSubmitting}
      onClick={onLogout}
    >
      {isSubmitting ? "Odjava..." : "Odjava"}
    </Button>
  );
}
