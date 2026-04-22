"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { archiveHabit } from "@/features/habits/actions";

export function ArchiveHabitButton({
  habitId,
  habitName,
}: {
  habitId: string;
  habitName: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (
          confirm(
            `Arquivar "${habitName}"? Ele some da lista, mas o histórico é mantido.`,
          )
        ) {
          startTransition(() => archiveHabit(habitId));
        }
      }}
    >
      {pending ? "Arquivando..." : "Arquivar"}
    </Button>
  );
}
