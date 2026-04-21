"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendMagicLink } from "@/features/auth/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Enviando..." : "Receber link de login"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(sendMagicLink, null);

  if (state?.status === "success") {
    return (
      <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-4 text-sm text-emerald-700 dark:text-emerald-300">
        <p className="font-medium">Link enviado!</p>
        <p className="mt-1 text-emerald-700/80 dark:text-emerald-300/80">
          Verifique sua caixa de entrada e clique no link para entrar. O link
          expira em 1 hora.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="voce@exemplo.com"
        />
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
