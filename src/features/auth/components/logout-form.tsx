"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";

function LogoutSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      {pending ? "Saindo..." : "Sair"}
    </Button>
  );
}

export function LogoutForm() {
  return (
    <form action={signOut}>
      <LogoutSubmit />
    </form>
  );
}
