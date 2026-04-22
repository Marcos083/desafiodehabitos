import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { ArchiveHabitButton } from "@/features/habits/components/archive-habit-button";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type Habit = {
  id: string;
  name: string;
  description: string | null;
  active_days: number[];
  user_id: string;
};

export function HabitsList({
  habits,
  currentUserId,
}: {
  habits: Habit[];
  currentUserId: string;
}) {
  if (habits.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        Você ainda não tem hábitos. Crie o primeiro!
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {habits.map((habit) => {
        const isOwner = habit.user_id === currentUserId;
        return (
          <li
            key={habit.id}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium">{habit.name}</p>
                {habit.description && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {habit.description}
                  </p>
                )}
              </div>
              {isOwner && (
                <div className="flex items-center gap-1">
                  <Link
                    href={`/habitos/${habit.id}/editar`}
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                    })}
                  >
                    Editar
                  </Link>
                  <ArchiveHabitButton
                    habitId={habit.id}
                    habitName={habit.name}
                  />
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {WEEKDAY_LABELS.map((label, index) => {
                const active = habit.active_days.includes(index);
                return (
                  <span
                    key={label}
                    className={
                      active
                        ? "rounded-md bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white dark:bg-white dark:text-zinc-900"
                        : "rounded-md border border-zinc-200 px-2 py-0.5 text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
                    }
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
