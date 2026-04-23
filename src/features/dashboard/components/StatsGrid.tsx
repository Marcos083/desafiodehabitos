import { CheckCircle2, Flame, Target, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-border bg-surface p-5">
      <div className="flex size-9 items-center justify-center rounded-full bg-signal-faint text-signal">
        <Icon className="size-4" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-medium leading-none tracking-tight text-ink tabular-nums">
          {value}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}

export type StatsGridProps = {
  pointsThisWeek: number;
  completionRate: number;
  habitsDoneToday: number;
  longestStreak: number;
};

export function StatsGrid({
  pointsThisWeek,
  completionRate,
  habitsDoneToday,
  longestStreak,
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        icon={Trophy}
        label="Pontos na semana"
        value={pointsThisWeek.toString()}
      />
      <StatCard
        icon={Target}
        label="Taxa de conclusão"
        value={`${completionRate}%`}
      />
      <StatCard
        icon={CheckCircle2}
        label="Feitos hoje"
        value={habitsDoneToday.toString()}
      />
      <StatCard
        icon={Flame}
        label="Maior streak"
        value={`${longestStreak}d`}
      />
    </div>
  );
}
