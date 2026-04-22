import { cn } from "@/lib/utils";

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

type Row = {
  userId: string;
  name: string;
  isMe: boolean;
  dailyDone: number[];
  dailyTotal: number[];
};

export function WeekGrid({
  rows,
  todayIndex,
}: {
  rows: Row[];
  todayIndex: number | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <th className="px-3 pb-2 text-left">Quem</th>
            {DAY_LABELS.map((label, i) => (
              <th
                key={label}
                className={cn(
                  "px-2 pb-2 text-center",
                  i === todayIndex && "text-zinc-900 dark:text-white",
                )}
              >
                {label}
              </th>
            ))}
            <th className="px-3 pb-2 text-center">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const totalDone = row.dailyDone.reduce((a, b) => a + b, 0);
            const totalPlanned = row.dailyTotal.reduce((a, b) => a + b, 0);
            return (
              <tr
                key={row.userId}
                className="rounded-lg bg-zinc-50 dark:bg-zinc-900"
              >
                <td className="rounded-l-lg px-3 py-3 font-medium">
                  {row.name}
                  {row.isMe && (
                    <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                      (você)
                    </span>
                  )}
                </td>
                {row.dailyDone.map((done, i) => {
                  const total = row.dailyTotal[i]!;
                  const isToday = i === todayIndex;
                  const isComplete = total > 0 && done === total;
                  const isPartial = total > 0 && done > 0 && done < total;
                  return (
                    <td
                      key={i}
                      className={cn(
                        "px-2 py-3 text-center tabular-nums",
                        isToday && "font-semibold",
                        total === 0 && "text-zinc-400 dark:text-zinc-600",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex min-w-10 items-center justify-center rounded-md px-2 py-1",
                          isComplete &&
                            "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                          isPartial &&
                            "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                        )}
                      >
                        {total === 0 ? "–" : `${done}/${total}`}
                      </span>
                    </td>
                  );
                })}
                <td className="rounded-r-lg px-3 py-3 text-center tabular-nums font-semibold">
                  {totalPlanned === 0 ? "–" : `${totalDone}/${totalPlanned}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
