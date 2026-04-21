"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPartnership } from "@/features/partnerships/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Criando..." : "Criar parceria"}
    </Button>
  );
}

export function CreatePartnershipForm() {
  const [state, formAction] = useActionState(createPartnership, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nome da parceria</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={80}
          placeholder="Ex: Marcos e Nicolas"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Você receberá um código de 6 caracteres para compartilhar com seu
          parceiro.
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
