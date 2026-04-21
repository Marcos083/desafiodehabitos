"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createHabit } from "@/features/habits/actions";

const WEEKDAYS = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Salvando..." : "Criar hábito"}
    </Button>
  );
}

export function HabitForm() {
  const [state, formAction] = useActionState(createHabit, null);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={80}
          placeholder="Ex: Beber 2L de água"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Input
          id="description"
          name="description"
          type="text"
          maxLength={280}
          placeholder="Detalhes que você queira lembrar"
        />
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium">Dias da semana</legend>
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAYS.map((day) => (
            <label
              key={day.value}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-zinc-200 p-2 text-xs has-checked:border-zinc-900 has-checked:bg-zinc-900 has-checked:text-white dark:border-zinc-700 dark:has-checked:border-white dark:has-checked:bg-white dark:has-checked:text-zinc-900"
            >
              <input
                type="checkbox"
                name="active_days"
                value={day.value}
                defaultChecked
                className="sr-only"
              />
              <span className="font-medium">{day.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {state?.status === "error" && (
        <p className="text-sm text-red-500" role="alert">
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
