import { Flame, Target, Trophy } from "lucide-react";
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

type PartnerStatsProps = {
  currentStreak: number;
  pointsThisWeek: number;
  completionRate30d: number;
};

export function PartnerStats({
  currentStreak,
  pointsThisWeek,
  completionRate30d,
}: PartnerStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatCard
        icon={Flame}
        label="Streak atual"
        value={`${currentStreak}d`}
      />
      <StatCard
        icon={Trophy}
        label="Pontos na semana"
        value={pointsThisWeek.toString()}
      />
      <StatCard
        icon={Target}
        label="Conclusão 30d"
        value={`${completionRate30d}%`}
      />
    </div>
  );
}
