import { Fragment } from "react";

import type { HeatmapCellState, HeatmapData } from "@/features/dashboard/queries";
import { cn } from "@/lib/utils";

function cellClasses(state: HeatmapCellState): string {
  switch (state) {
    case "done":
      return "bg-signal";
    case "today":
      return "bg-signal/30 ring-1 ring-signal/50";
    case "missed":
      return "bg-signal/15";
    case "future":
      return "bg-signal/10";
    case "off":
      return "bg-bg";
  }
}

export function WeekHeatmap({ weekDays, rows }: HeatmapData) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[20px] border border-border bg-surface p-5">
        <h3 className="text-sm font-medium text-ink">Semana</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          Crie seu primeiro hábito para ver o progresso semanal.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-ink">Semana</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {rows.length} {rows.length === 1 ? "hábito" : "hábitos"}
        </span>
      </div>

      <div
        className="grid items-center gap-x-1 gap-y-2"
        style={{
          gridTemplateColumns: "minmax(0, 1fr) repeat(7, minmax(24px, 32px))",
        }}
      >
        <span />
        {weekDays.map((day) => (
          <span
            key={day.iso}
            className={cn(
              "text-center text-[10px] font-medium uppercase tracking-wide",
              day.isToday ? "text-ink" : "text-muted-foreground",
            )}
          >
            {day.label}
          </span>
        ))}

        {rows.map((row) => (
          <Fragment key={row.habitId}>
            <span className="truncate pr-2 text-xs text-ink">
              {row.habitName}
            </span>
            {row.cells.map((cell) => (
              <span
                key={cell.iso}
                title={cell.iso}
                className={cn(
                  "mx-auto size-7 rounded-[8px] transition-colors",
                  cellClasses(cell.state),
                )}
              />
            ))}
          </Fragment>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-muted-foreground">
        <LegendSwatch className="bg-signal" label="Feito" />
        <LegendSwatch className="bg-signal/30" label="Hoje" />
        <LegendSwatch className="bg-signal/15" label="Perdido" />
        <LegendSwatch className="bg-signal/10" label="Futuro" />
        <LegendSwatch className="bg-bg ring-1 ring-border" label="Folga" />
      </div>
    </div>
  );
}

function LegendSwatch({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-3 rounded-[4px]", className)} />
      {label}
    </span>
  );
}
