import { Flame } from "lucide-react";

import { cn } from "@/lib/utils";

export type StreakWeekDay = {
  label: string;
  completionRatio: number;
  isToday: boolean;
};

type StreakCardProps = {
  currentStreak: number;
  weekDays: StreakWeekDay[];
};

function segmentOpacity(ratio: number): string {
  if (ratio <= 0) return "bg-signal/10";
  if (ratio < 0.5) return "bg-signal/40";
  if (ratio < 1) return "bg-signal/70";
  return "bg-signal";
}

export function StreakCard({ currentStreak, weekDays }: StreakCardProps) {
  return (
    <div className="flex flex-col gap-6 rounded-[20px] border border-border bg-surface p-6 lg:p-8">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Streak atual
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-semibold leading-none tracking-tight text-ink tabular-nums lg:text-7xl">
              {currentStreak}
            </span>
            <span className="text-lg font-medium text-muted-foreground">
              {currentStreak === 1 ? "dia" : "dias"}
            </span>
          </div>
        </div>
        <div className="flex size-12 items-center justify-center rounded-full bg-signal-faint text-signal">
          <Flame className="size-6" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-colors",
                segmentOpacity(day.completionRatio),
                day.isToday && "ring-2 ring-ink/20 ring-offset-2 ring-offset-surface",
              )}
            />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((day, i) => (
            <span
              key={i}
              className={cn(
                "text-center text-[11px] font-medium uppercase tracking-wide",
                day.isToday ? "text-ink" : "text-muted-foreground",
              )}
            >
              {day.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
