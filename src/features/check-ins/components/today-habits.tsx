import { CheckInButton } from "@/features/check-ins/components/check-in-button";

type Habit = {
  id: string;
  name: string;
  description: string | null;
  active_days: number[];
  user_id: string;
};

type CheckIn = {
  habit_id: string;
  user_id: string;
};

export function TodayHabits({
  habits,
  checkIns,
  currentUserId,
  date,
}: {
  habits: Habit[];
  checkIns: CheckIn[];
  currentUserId: string;
  date: string;
}) {
  if (habits.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        Nenhum hábito seu programado pra esse dia. Bom descanso!
      </div>
    );
  }

  const checkedSet = new Set(
    checkIns
      .filter((c) => c.user_id === currentUserId)
      .map((c) => c.habit_id),
  );

  return (
    <ul className="flex flex-col gap-3">
      {habits.map((habit) => {
        const checked = checkedSet.has(habit.id);
        return (
          <li
            key={habit.id}
            className="flex items-center gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <CheckInButton habitId={habit.id} checked={checked} date={date} />
            <div className="flex-1">
              <p className="font-medium">{habit.name}</p>
              {habit.description && (
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  {habit.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
