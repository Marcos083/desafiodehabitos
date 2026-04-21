"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinPartnership } from "@/features/partnerships/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Entrando..." : "Entrar na parceria"}
    </Button>
  );
}

export function JoinPartnershipForm() {
  const [state, formAction] = useActionState(joinPartnership, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="code">Código de convite</Label>
        <Input
          id="code"
          name="code"
          type="text"
          required
          minLength={6}
          maxLength={6}
          autoCapitalize="characters"
          autoComplete="off"
          className="uppercase tracking-[0.3em]"
          placeholder="ABC123"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Peça o código de 6 caracteres para seu parceiro.
        </p>
      </div>
      {state?.status === "error" && (
        <p className="text-sm text-red-500" role="alert">
          {state.message}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
