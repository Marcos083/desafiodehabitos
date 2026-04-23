import { redirect } from "next/navigation";

import { CalendarWidget } from "@/features/dashboard/components/CalendarWidget";
import { GreetingCard } from "@/features/dashboard/components/GreetingCard";
import { PartnerCard } from "@/features/dashboard/components/PartnerCard";
import { StatsGrid } from "@/features/dashboard/components/StatsGrid";
import { StreakCard } from "@/features/dashboard/components/StreakCard";
import { TodayList } from "@/features/dashboard/components/TodayList";
import { WeekHeatmap } from "@/features/dashboard/components/WeekHeatmap";
import { getDashboardData } from "@/features/dashboard/queries";
import { getCurrentPartnership } from "@/features/partnerships/queries";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const partnership = await getCurrentPartnership();
  if (!partnership) redirect("/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user!.id)
    .single();

  const displayName = profile?.display_name ?? user!.email ?? "você";

  const data = await getDashboardData({
    partnershipId: partnership.id,
    userId: user!.id,
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <GreetingCard name={displayName} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <StreakCard
            currentStreak={data.currentStreak}
            weekDays={data.streakWeekDays}
          />
          <StatsGrid
            pointsThisWeek={data.pointsThisWeek}
            completionRate={data.completionRate}
            habitsDoneToday={data.habitsDoneToday}
            longestStreak={data.longestStreak}
          />
          <WeekHeatmap
            weekDays={data.heatmap.weekDays}
            rows={data.heatmap.rows}
          />
        </div>

        <div className="flex flex-col gap-4">
          <PartnerCard
            partnerName={data.partnerName}
            partnerAvatarUrl={data.partnerAvatarUrl}
            lastCheckInHabit={data.partnerLastCheckInHabit}
            doneToday={data.partnerDoneToday}
            totalToday={data.partnerTotalToday}
          />
          <TodayList incompleteHabits={data.incompleteHabitsToday} />
          <CalendarWidget
            year={data.calendarYear}
            month={data.calendarMonth}
            checkedDates={data.calendarCheckedDates}
            today={data.calendarToday}
          />
        </div>
      </div>
    </div>
  );
}
