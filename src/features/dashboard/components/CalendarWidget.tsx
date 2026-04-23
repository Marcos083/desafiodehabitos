import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function monthLabel(year: number, month: number): string {
  const name = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(
    new Date(Date.UTC(year, month, 1)),
  );
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function firstWeekdayOffsetMondayStart(year: number, month: number): number {
  const d = new Date(Date.UTC(year, month, 1)).getUTCDay();
  return d === 0 ? 6 : d - 1;
}

function toISO(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

type CalendarWidgetProps = {
  year: number;
  month: number;
  checkedDates: Set<string>;
  today: string;
};

export function CalendarWidget({
  year,
  month,
  checkedDates,
  today,
}: CalendarWidgetProps) {
  const total = daysInMonth(year, month);
  const offset = firstWeekdayOffsetMondayStart(year, month);

  const cells: Array<{ day: number; iso: string } | null> = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: total }, (_, i) => {
      const day = i + 1;
      return { day, iso: toISO(year, month, day) };
    }),
  ];

  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-border bg-surface p-5">
      <h3 className="text-sm font-medium text-ink">{monthLabel(year, month)}</h3>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            {label}
          </span>
        ))}

        {cells.map((cell, i) => {
          if (!cell) return <span key={`pad-${i}`} />;
          const checked = checkedDates.has(cell.iso);
          const isToday = cell.iso === today;
          return (
            <span
              key={cell.iso}
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-xs tabular-nums transition-colors",
                checked && "bg-signal font-medium text-surface",
                !checked && isToday && "bg-signal-faint font-medium text-ink",
                !checked && !isToday && "text-ink/70",
                isToday && checked && "ring-2 ring-ink/20 ring-offset-1 ring-offset-surface",
              )}
            >
              {cell.day}
            </span>
          );
        })}
      </div>
    </div>
  );
}
