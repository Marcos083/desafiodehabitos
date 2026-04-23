import { getHabits } from "@/features/habits/queries";
import { getPartnershipMembers } from "@/features/partnerships/queries";
import { createClient } from "@/lib/supabase/server";
import {
  addDaysISO,
  currentWeekRangeBR,
  todayInBR,
} from "@/lib/date";

export type PartnerHabitTodayStatus = "done" | "pending" | "off";

export type PartnerHabitItem = {
  id: string;
  name: string;
  description: string | null;
  activeDays: number[];
  points: number;
  todayStatus: PartnerHabitTodayStatus;
};

export type PartnerActivityItem = {
  id: string;
  habitName: string;
  date: string;
  createdAt: string;
};

export type PartnerPageData = {
  hasPartner: boolean;
  partner: {
    userId: string;
    name: string;
    initial: string;
    avatarUrl: string | null;
    joinedAt: string;
  } | null;
  partnership: {
    name: string;
    inviteCode: string;
    createdAt: string;
  };
  today: {
    done: number;
    total: number;
    ratio: number;
  };
  stats: {
    currentStreak: number;
    pointsThisWeek: number;
    completionRate30d: number;
  };
  habits: PartnerHabitItem[];
  activity: PartnerActivityItem[];
};

function weekdayFromISO(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay();
}

export async function getPartnerPageData({
  partnership,
  userId,
}: {
  partnership: { id: string; name: string; invite_code: string; created_at: string };
  userId: string;
}): Promise<PartnerPageData> {
  const supabase = await createClient();
  const today = todayInBR();
  const { start: weekStart, end: weekEnd } = currentWeekRangeBR();
  const windowStart = addDaysISO(today, -30);

  const [habits, members, { data: partnerChecksRaw, error: checksErr }] =
    await Promise.all([
      getHabits(partnership.id),
      getPartnershipMembers(partnership.id),
      supabase
        .from("check_ins")
        .select("id, habit_id, user_id, date, created_at")
        .eq("partnership_id", partnership.id)
        .gte("date", windowStart)
        .lte("date", today)
        .order("created_at", { ascending: false }),
    ]);

  if (checksErr) throw checksErr;

  const partner = members.find((m) => m.user_id !== userId) ?? null;

  const partnershipMeta = {
    name: partnership.name,
    inviteCode: partnership.invite_code,
    createdAt: partnership.created_at,
  };

  if (!partner) {
    return {
      hasPartner: false,
      partner: null,
      partnership: partnershipMeta,
      today: { done: 0, total: 0, ratio: 0 },
      stats: { currentStreak: 0, pointsThisWeek: 0, completionRate30d: 0 },
      habits: [],
      activity: [],
    };
  }

  const partnerHabits = habits.filter((h) => h.user_id === partner.user_id);
  const habitById = new Map(partnerHabits.map((h) => [h.id, h]));
  const partnerChecks = (partnerChecksRaw ?? []).filter(
    (c) => c.user_id === partner.user_id && habitById.has(c.habit_id),
  );

  const checksByDate = new Map<string, Set<string>>();
  for (const c of partnerChecks) {
    if (!checksByDate.has(c.date)) checksByDate.set(c.date, new Set());
    checksByDate.get(c.date)!.add(c.habit_id);
  }

  function scheduledOn(iso: string) {
    const wd = weekdayFromISO(iso);
    return partnerHabits.filter((h) => h.active_days.includes(wd));
  }

  const todayScheduled = scheduledOn(today);
  const todayDoneSet = checksByDate.get(today) ?? new Set();
  const todayDone = todayScheduled.filter((h) => todayDoneSet.has(h.id)).length;
  const todayTotal = todayScheduled.length;
  const todayRatio = todayTotal === 0 ? 0 : todayDone / todayTotal;

  let currentStreak = 0;
  let cursor = today;
  if (todayTotal > 0 && todayDone < todayTotal) {
    cursor = addDaysISO(today, -1);
  }
  while (cursor >= windowStart) {
    const scheduled = scheduledOn(cursor);
    if (scheduled.length > 0) {
      const done = checksByDate.get(cursor) ?? new Set();
      const complete = scheduled.every((h) => done.has(h.id));
      if (!complete) break;
      currentStreak++;
    }
    cursor = addDaysISO(cursor, -1);
  }

  let pointsThisWeek = 0;
  for (const c of partnerChecks) {
    if (c.date >= weekStart && c.date <= weekEnd) {
      pointsThisWeek += habitById.get(c.habit_id)?.points ?? 0;
    }
  }

  let scheduled30 = 0;
  let done30 = 0;
  let scan = windowStart;
  while (scan <= today) {
    const sched = scheduledOn(scan);
    scheduled30 += sched.length;
    const done = checksByDate.get(scan) ?? new Set();
    done30 += sched.filter((h) => done.has(h.id)).length;
    scan = addDaysISO(scan, 1);
  }
  const completionRate30d =
    scheduled30 === 0 ? 0 : Math.round((done30 / scheduled30) * 100);

  const habitItems: PartnerHabitItem[] = partnerHabits.map((h) => {
    const isScheduled = h.active_days.includes(weekdayFromISO(today));
    let todayStatus: PartnerHabitTodayStatus;
    if (!isScheduled) todayStatus = "off";
    else if (todayDoneSet.has(h.id)) todayStatus = "done";
    else todayStatus = "pending";
    return {
      id: h.id,
      name: h.name,
      description: h.description ?? null,
      activeDays: [...h.active_days].sort(),
      points: h.points,
      todayStatus,
    };
  });

  const activity: PartnerActivityItem[] = partnerChecks
    .slice(0, 10)
    .map((c) => ({
      id: c.id,
      habitName: habitById.get(c.habit_id)?.name ?? "—",
      date: c.date,
      createdAt: c.created_at,
    }));

  return {
    hasPartner: true,
    partner: {
      userId: partner.user_id,
      name: partner.display_name ?? "parceiro",
      initial:
        (partner.display_name ?? "?").trim().charAt(0).toUpperCase() || "?",
      avatarUrl: partner.avatar_url ?? null,
      joinedAt: partner.joined_at,
    },
    partnership: partnershipMeta,
    today: { done: todayDone, total: todayTotal, ratio: todayRatio },
    stats: { currentStreak, pointsThisWeek, completionRate30d },
    habits: habitItems,
    activity,
  };
}
