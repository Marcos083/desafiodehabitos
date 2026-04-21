const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type Habit = {
  id: string;
  name: string;
  description: string | null;
  active_days: number[];
};

export function HabitsList({ habits }: { habits: Habit[] }) {
  if (habits.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        Você ainda não tem hábitos. Crie o primeiro!
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {habits.map((habit) => (
        <li
          key={habit.id}
          className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <p className="font-medium">{habit.name}</p>
          {habit.description && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {habit.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {WEEKDAY_LABELS.map((label, index) => {
              const active = habit.active_days.includes(index);
              return (
                <span
                  key={label}
                  className={
                    active
                      ? "rounded-md bg-zinc-900 px-2 py-0.5 text-xs font-medium text-white dark:bg-white dark:text-zinc-900"
                      : "rounded-md border border-zinc-200 px-2 py-0.5 text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
                  }
                >
                  {label}
                </span>
              );
            })}
          </div>
        </li>
      ))}
    </ul>
  );
}
