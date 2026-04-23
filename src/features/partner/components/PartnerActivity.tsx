import { Check } from "lucide-react";

import type { PartnerActivityItem } from "@/features/partner/queries";
import { todayInBR, addDaysISO } from "@/lib/date";

function relativeDayLabel(date: string): string {
  const today = todayInBR();
  if (date === today) return "Hoje";
  if (date === addDaysISO(today, -1)) return "Ontem";
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(Date.UTC(y!, m! - 1, d!)));
}

function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

type PartnerActivityProps = {
  items: PartnerActivityItem[];
};

export function PartnerActivity({ items }: PartnerActivityProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-border bg-surface p-5 lg:p-6">
      <h2 className="text-sm font-medium text-ink">Atividade recente</h2>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nenhum check-in nos últimos 30 dias.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-signal-faint text-signal">
                <Check className="size-4" strokeWidth={3} />
              </div>
              <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
                <span className="truncate text-sm text-ink">
                  {item.habitName}
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                  {relativeDayLabel(item.date)} · {timeLabel(item.createdAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
