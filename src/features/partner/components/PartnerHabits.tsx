import { Check, Clock, Minus } from "lucide-react";

import type { PartnerHabitItem } from "@/features/partner/queries";
import { cn } from "@/lib/utils";

const WEEKDAY_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"] as const;
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

function daysSummary(days: number[]): string {
  if (days.length === 7) return "Todo dia";
  if (
    days.length === 5 &&
    [1, 2, 3, 4, 5].every((d) => days.includes(d))
  )
    return "Seg a Sex";
  if (days.length === 2 && days.includes(0) && days.includes(6))
    return "Fim de semana";
  return days.map((d) => WEEKDAY_SHORT[d]).join("·");
}

function StatusPill({ status }: { status: PartnerHabitItem["todayStatus"] }) {
  if (status === "done") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-signal-faint px-2 py-0.5 text-[11px] font-medium text-signal">
        <Check className="size-3" strokeWidth={3} /> Feito
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-bg px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        <Clock className="size-3" /> Pendente
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-bg px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      <Minus className="size-3" /> Folga
    </span>
  );
}

type PartnerHabitsProps = {
  habits: PartnerHabitItem[];
};

export function PartnerHabits({ habits }: PartnerHabitsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-border bg-surface p-5 lg:p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-ink">Hábitos</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {habits.length}
        </span>
      </div>

      {habits.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Seu parceiro ainda não cadastrou hábitos.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {habits.map((habit) => (
            <li
              key={habit.id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-[14px] bg-bg px-3 py-2.5",
              )}
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm text-ink">{habit.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {daysSummary(habit.activeDays.length > 0 ? habit.activeDays : ALL_DAYS)}
                  <span className="mx-1.5">·</span>
                  {habit.points} {habit.points === 1 ? "pt" : "pts"}
                </span>
              </div>
              <StatusPill status={habit.todayStatus} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
