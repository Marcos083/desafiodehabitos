"use client";

import { Check } from "lucide-react";
import { useTransition } from "react";

import { toggleCheckIn } from "@/features/check-ins/actions";
import { cn } from "@/lib/utils";

type TodayListItem = {
  id: string;
  name: string;
};

type TodayListProps = {
  incompleteHabits: TodayListItem[];
};

export function TodayList({ incompleteHabits }: TodayListProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-ink">Pendentes hoje</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {incompleteHabits.length}
        </span>
      </div>

      {incompleteHabits.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-signal-faint text-signal">
            <Check className="size-5" />
          </div>
          <p className="text-sm text-ink">Tudo feito por hoje.</p>
          <p className="text-xs text-muted-foreground">
            Você já marcou todos os hábitos programados.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {incompleteHabits.map((habit) => (
            <TodayListRow key={habit.id} habit={habit} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TodayListRow({ habit }: { habit: TodayListItem }) {
  const [pending, startTransition] = useTransition();

  return (
    <li>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => toggleCheckIn(habit.id))}
        className={cn(
          "group flex w-full items-center gap-3 rounded-[14px] bg-bg px-3 py-2.5 text-left transition-colors hover:bg-signal-faint",
          pending && "opacity-50",
        )}
      >
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-border bg-surface text-transparent transition-colors",
            "group-hover:border-signal group-hover:text-signal",
          )}
        >
          <Check className="size-3.5" strokeWidth={3} />
        </span>
        <span className="truncate text-sm text-ink">{habit.name}</span>
      </button>
    </li>
  );
}
