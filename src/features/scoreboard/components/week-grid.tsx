import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

const DAY_LABELS = [
  { short: "Seg", long: "Segunda-feira" },
  { short: "Ter", long: "Terça-feira" },
  { short: "Qua", long: "Quarta-feira" },
  { short: "Qui", long: "Quinta-feira" },
  { short: "Sex", long: "Sexta-feira" },
  { short: "Sáb", long: "Sábado" },
  { short: "Dom", long: "Domingo" },
];

type Row = {
  userId: string;
  name: string;
  isMe: boolean;
  dailyDone: number[];
  dailyTotal: number[];
};

type CellState = "complete" | "partial" | "empty" | "off";

function cellState(done: number, total: number): CellState {
  if (total === 0) return "off";
  if (done === 0) return "empty";
  if (done < total) return "partial";
  return "complete";
}

function cellAriaLabel(state: CellState, done: number, total: number): string {
  switch (state) {
    case "off":
      return "sem hábito programado";
    case "complete":
      return `completo, ${done} de ${total}`;
    case "partial":
      return `parcial, ${done} de ${total}`;
    case "empty":
      return `nenhum feito, ${done} de ${total}`;
  }
}

export function WeekGrid({
  rows,
  todayIndex,
}: {
  rows: Row[];
  todayIndex: number | null;
}) {
  return (
    <div className="overflow-x-auto rounded-[20px] border border-border bg-surface">
      <table className="w-full text-sm">
        <caption className="sr-only">
          Placar semanal: número de hábitos concluídos por dia.
        </caption>
        <thead>
          <tr className="border-b border-border">
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Quem
            </th>
            {DAY_LABELS.map((day, i) => {
              const isToday = i === todayIndex;
              return (
                <th
                  key={day.short}
                  scope="col"
                  aria-current={isToday ? "date" : undefined}
                  className={cn(
                    "px-2 py-3 text-center text-xs font-medium uppercase tracking-wide",
                    isToday
                      ? "text-ink"
                      : "text-muted-foreground",
                  )}
                >
                  <span aria-hidden>{day.short}</span>
                  <span className="sr-only">{day.long}</span>
                  {isToday && (
                    <span className="ml-1 text-signal" aria-hidden>
                      •
                    </span>
                  )}
                </th>
              );
            })}
            <th
              scope="col"
              className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => {
            const totalDone = row.dailyDone.reduce((a, b) => a + b, 0);
            const totalPlanned = row.dailyTotal.reduce((a, b) => a + b, 0);
            const isLast = rowIdx === rows.length - 1;

            return (
              <tr
                key={row.userId}
                className={cn(!isLast && "border-b border-border")}
              >
                <th
                  scope="row"
                  className="px-4 py-3 text-left font-medium text-ink"
                >
                  {row.name}
                  {row.isMe && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      (você)
                    </span>
                  )}
                </th>
                {row.dailyDone.map((done, i) => {
                  const total = row.dailyTotal[i]!;
                  const state = cellState(done, total);
                  const isToday = i === todayIndex;
                  return (
                    <td
                      key={i}
                      aria-current={isToday ? "date" : undefined}
                      aria-label={cellAriaLabel(state, done, total)}
                      className={cn(
                        "px-2 py-3 text-center",
                        isToday && "bg-signal-faint/40",
                      )}
                    >
                      <CellBadge
                        state={state}
                        done={done}
                        total={total}
                        isToday={isToday}
                      />
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex min-w-12 items-center justify-center rounded-full bg-bg px-3 py-1 text-sm font-semibold text-ink tabular-nums">
                    {totalPlanned === 0 ? (
                      <>
                        <span aria-hidden>–</span>
                        <span className="sr-only">sem hábitos</span>
                      </>
                    ) : (
                      `${totalDone}/${totalPlanned}`
                    )}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CellBadge({
  state,
  done,
  total,
  isToday,
}: {
  state: CellState;
  done: number;
  total: number;
  isToday: boolean;
}) {
  if (state === "off") {
    return (
      <span
        aria-hidden
        className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground"
      >
        <Minus className="size-3.5" />
      </span>
    );
  }

  const text = `${done}/${total}`;

  if (state === "complete") {
    return (
      <span
        aria-hidden
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-signal px-3 py-1 text-sm font-semibold text-surface tabular-nums",
          isToday && "ring-2 ring-signal/40 ring-offset-2 ring-offset-surface",
        )}
      >
        <Check className="size-3.5" strokeWidth={3} />
        {text}
      </span>
    );
  }

  if (state === "partial") {
    return (
      <span
        aria-hidden
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-signal/40 bg-signal-faint px-3 py-1 text-sm font-semibold text-ink tabular-nums",
          isToday && "ring-2 ring-signal/40 ring-offset-2 ring-offset-surface",
        )}
      >
        {text}
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-bg px-3 py-1 text-sm font-medium text-muted-foreground tabular-nums",
        isToday && "ring-2 ring-signal/40 ring-offset-2 ring-offset-surface",
      )}
    >
      {text}
    </span>
  );
}
