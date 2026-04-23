import { getHabits } from "@/features/habits/queries";
import { getPartnershipMembers } from "@/features/partnerships/queries";
import { getWeekCheckIns } from "@/features/scoreboard/queries";
import {
  addDaysISO,
  currentMonthBoundsBR,
  currentWeekRangeBR,
  todayInBR,
} from "@/lib/date";

const WEEKDAY_LABELS_SHORT = ["S", "T", "Q", "Q", "S", "S", "D"] as const;
const WEEKDAY_LABELS_FULL = [
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
  "Dom",
] as const;

export type HeatmapCellState =
  | "off"
  | "done"
  | "missed"
  | "today"
  | "future";

export type HeatmapData = {
  weekDays: Array<{ iso: string; label: string; isToday: boolean }>;
  rows: Array<{
    habitId: string;
    habitName: string;
    cells: Array<{ iso: string; state: HeatmapCellState }>;
  }>;
};

export type StreakWeekDay = {
  label: string;
  completionRatio: number;
  isToday: boolean;
};

export type DashboardData = {
  currentStreak: number;
  longestStreak: number;
  streakWeekDays: StreakWeekDay[];
  pointsThisWeek: number;
  completionRate: number;
  habitsDoneToday: number;
  incompleteHabitsToday: Array<{ id: string; name: string }>;
  partnerName: string | null;
  partnerAvatarUrl: string | null;
  partnerLastCheckInHabit: string | null;
  partnerDoneToday: number;
  partnerTotalToday: number;
  calendarYear: number;
  calendarMonth: number;
  calendarCheckedDates: Set<string>;
  calendarToday: string;
  heatmap: HeatmapData;
};

function weekdayFromISO(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay();
}

function minISO(values: string[]): string {
  return values.reduce((acc, v) => (v < acc ? v : acc));
}

function maxISO(values: string[]): string {
  return values.reduce((acc, v) => (v > acc ? v : acc));
}

export async function getDashboardData({
  partnershipId,
  userId,
}: {
  partnershipId: string;
  userId: string;
}): Promise<DashboardData> {
  const today = todayInBR();
  const { start: weekStart, end: weekEnd, days: weekIsos } =
    currentWeekRangeBR();
  const {
    year: monthYear,
    month: monthIdx,
    first: monthStart,
    last: monthEnd,
  } = currentMonthBoundsBR();
  const historyStart = addDaysISO(today, -60);

  const rangeStart = minISO([historyStart, monthStart, weekStart]);
  const rangeEnd = maxISO([today, monthEnd, weekEnd]);

  const [habits, checkIns, members] = await Promise.all([
    getHabits(partnershipId),
    getWeekCheckIns(partnershipId, rangeStart, rangeEnd),
    getPartnershipMembers(partnershipId),
  ]);

  const myHabits = habits.filter((h) => h.user_id === userId);
  const partnerHabits = habits.filter((h) => h.user_id !== userId);
  const myChecks = checkIns.filter((c) => c.user_id === userId);
  const partnerChecks = checkIns.filter((c) => c.user_id !== userId);
  const partner = members.find((m) => m.user_id !== userId) ?? null;
  const habitById = new Map(habits.map((h) => [h.id, h]));

  const myChecksByDate = new Map<string, Set<string>>();
  for (const c of myChecks) {
    if (!myChecksByDate.has(c.date)) myChecksByDate.set(c.date, new Set());
    myChecksByDate.get(c.date)!.add(c.habit_id);
  }

  function scheduledOn(habitList: typeof habits, iso: string) {
    const wd = weekdayFromISO(iso);
    return habitList.filter((h) => h.active_days.includes(wd));
  }

  function dayIsComplete(iso: string): boolean {
    const scheduled = scheduledOn(myHabits, iso);
    if (scheduled.length === 0) return true;
    const done = myChecksByDate.get(iso) ?? new Set();
    return scheduled.every((h) => done.has(h.id));
  }

  const todayScheduledMine = scheduledOn(myHabits, today);
  const todayDoneMine = myChecksByDate.get(today) ?? new Set();
  const habitsDoneToday = todayScheduledMine.filter((h) =>
    todayDoneMine.has(h.id),
  ).length;

  let currentStreak = 0;
  let cursor = today;
  const hasScheduleToday = todayScheduledMine.length > 0;
  if (hasScheduleToday && habitsDoneToday < todayScheduledMine.length) {
    cursor = addDaysISO(today, -1);
  }
  while (cursor >= historyStart) {
    if (!dayIsComplete(cursor)) break;
    if (scheduledOn(myHabits, cursor).length > 0) currentStreak++;
    cursor = addDaysISO(cursor, -1);
  }

  let longestStreak = currentStreak;
  let run = 0;
  let scan = historyStart;
  while (scan <= today) {
    const scheduled = scheduledOn(myHabits, scan);
    if (scheduled.length === 0) {
      scan = addDaysISO(scan, 1);
      continue;
    }
    if (dayIsComplete(scan)) {
      run++;
      if (run > longestStreak) longestStreak = run;
    } else {
      run = 0;
    }
    scan = addDaysISO(scan, 1);
  }

  const streakWeekDays: StreakWeekDay[] = weekIsos.map((iso, idx) => {
    const scheduled = scheduledOn(myHabits, iso);
    const done = myChecksByDate.get(iso) ?? new Set();
    const doneCount = scheduled.filter((h) => done.has(h.id)).length;
    const ratio = scheduled.length === 0 ? 0 : doneCount / scheduled.length;
    return {
      label: WEEKDAY_LABELS_SHORT[idx]!,
      completionRatio: ratio,
      isToday: iso === today,
    };
  });

  const weekChecksMine = myChecks.filter(
    (c) => c.date >= weekStart && c.date <= weekEnd,
  );
  const pointsThisWeek = weekChecksMine.reduce((sum, c) => {
    const h = habitById.get(c.habit_id);
    return sum + (h?.points ?? 0);
  }, 0);

  let scheduledUpToToday = 0;
  let doneUpToToday = 0;
  for (const iso of weekIsos) {
    if (iso > today) break;
    const scheduled = scheduledOn(myHabits, iso);
    scheduledUpToToday += scheduled.length;
    const done = myChecksByDate.get(iso) ?? new Set();
    doneUpToToday += scheduled.filter((h) => done.has(h.id)).length;
  }
  const completionRate =
    scheduledUpToToday === 0
      ? 0
      : Math.round((doneUpToToday / scheduledUpToToday) * 100);

  const incompleteHabitsToday = todayScheduledMine
    .filter((h) => !todayDoneMine.has(h.id))
    .map((h) => ({ id: h.id, name: h.name }));

  const partnerTodayChecks = partnerChecks.filter((c) => c.date === today);
  const lastPartnerCheck = partnerTodayChecks[partnerTodayChecks.length - 1];
  const partnerLastCheckInHabit = lastPartnerCheck
    ? habitById.get(lastPartnerCheck.habit_id)?.name ?? null
    : null;
  const partnerDoneToday = partnerTodayChecks.length;
  const partnerTotalToday = scheduledOn(partnerHabits, today).length;

  const calendarCheckedDates = new Set(
    myChecks
      .filter((c) => c.date >= monthStart && c.date <= monthEnd)
      .map((c) => c.date),
  );

  const heatmap: HeatmapData = {
    weekDays: weekIsos.map((iso, idx) => ({
      iso,
      label: WEEKDAY_LABELS_FULL[idx]!,
      isToday: iso === today,
    })),
    rows: myHabits.map((habit) => ({
      habitId: habit.id,
      habitName: habit.name,
      cells: weekIsos.map((iso) => {
        const scheduled = habit.active_days.includes(weekdayFromISO(iso));
        const done = myChecksByDate.get(iso)?.has(habit.id) ?? false;
        let state: HeatmapCellState;
        if (!scheduled) state = "off";
        else if (done) state = "done";
        else if (iso === today) state = "today";
        else if (iso < today) state = "missed";
        else state = "future";
        return { iso, state };
      }),
    })),
  };

  return {
    currentStreak,
    longestStreak,
    streakWeekDays,
    pointsThisWeek,
    completionRate,
    habitsDoneToday,
    incompleteHabitsToday,
    partnerName: partner?.display_name ?? null,
    partnerAvatarUrl: partner?.avatar_url ?? null,
    partnerLastCheckInHabit,
    partnerDoneToday,
    partnerTotalToday,
    calendarYear: monthYear,
    calendarMonth: monthIdx,
    calendarCheckedDates,
    calendarToday: today,
    heatmap,
  };
}
