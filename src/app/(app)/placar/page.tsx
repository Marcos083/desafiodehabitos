import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckInsRealtime } from "@/features/check-ins/components/check-ins-realtime";
import { getHabits } from "@/features/habits/queries";
import {
  getCurrentPartnership,
  getPartnershipMembers,
} from "@/features/partnerships/queries";
import { WeekGrid } from "@/features/scoreboard/components/week-grid";
import { getWeekCheckIns } from "@/features/scoreboard/queries";
import { currentWeekRangeBR, todayInBR } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";

export default async function PlacarPage() {
  const partnership = await getCurrentPartnership();
  if (!partnership) redirect("/onboarding");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { start, end, days } = currentWeekRangeBR();
  const today = todayInBR();
  const todayIndex = days.indexOf(today);

  const [habits, checkIns, members] = await Promise.all([
    getHabits(partnership.id),
    getWeekCheckIns(partnership.id, start, end),
    getPartnershipMembers(partnership.id),
  ]);

  const rows = members.map((member) => {
    const userHabits = habits.filter((h) => h.user_id === member.user_id);
    const userCheckIns = checkIns.filter(
      (c) => c.user_id === member.user_id,
    );

    const dailyTotal = days.map((isoDate) => {
      const [y, m, d] = isoDate.split("-").map(Number);
      const weekday = new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay();
      return userHabits.filter((h) => h.active_days.includes(weekday)).length;
    });

    const dailyDone = days.map((isoDate) => {
      return userCheckIns.filter((c) => c.date === isoDate).length;
    });

    return {
      userId: member.user_id,
      name: member.display_name ?? "parceiro",
      isMe: member.user_id === user!.id,
      dailyDone,
      dailyTotal,
    };
  });

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <CheckInsRealtime partnershipId={partnership.id} />
      <div>
        <Link
          href="/hoje"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          ← Voltar
        </Link>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Placar da semana
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {start} a {end}
        </p>
      </div>

      <WeekGrid
        rows={rows}
        todayIndex={todayIndex === -1 ? null : todayIndex}
      />

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Cada célula mostra <span className="font-medium">feitos/programados</span>{" "}
        no dia. Verde = dia completo. Âmbar = parcial. &quot;–&quot; = sem
        hábito programado.
      </p>
    </main>
  );
}
