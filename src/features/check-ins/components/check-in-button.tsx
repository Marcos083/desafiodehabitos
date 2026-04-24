"use client";

import { useTransition } from "react";

import { toggleCheckIn } from "@/features/check-ins/actions";
import { cn } from "@/lib/utils";

export function CheckInButton({
  habitId,
  checked,
  date,
}: {
  habitId: string;
  checked: boolean;
  date: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={checked}
      onClick={() => startTransition(() => toggleCheckIn(habitId, date))}
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full border-2 transition-all",
        checked
          ? "border-emerald-500 bg-emerald-500 text-white"
          : "border-zinc-300 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:hover:border-white dark:hover:text-white",
        pending && "opacity-50",
      )}
      aria-label={checked ? "Desmarcar check-in" : "Marcar check-in"}
    >
      {checked ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-6"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <span className="size-3 rounded-full" />
      )}
    </button>
  );
}
