import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { LogoutForm } from "@/features/auth/components/logout-form";
import { CheckInsRealtime } from "@/features/check-ins/components/check-ins-realtime";
import { TodayHabits } from "@/features/check-ins/components/today-habits";
import { getTodayCheckIns } from "@/features/check-ins/queries";
import { getHabits } from "@/features/habits/queries";
import {
  getCurrentPartnership,
  getPartnershipMembers,
} from "@/features/partnerships/queries";
import { weekdayInBR } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";

export default async function HojePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const partnership = await getCurrentPartnership();

  if (!partnership) {
    redirect("/onboarding");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user!.id)
    .single();

  const displayName = profile?.display_name ?? user!.email ?? "você";

  const members = await getPartnershipMembers(partnership.id);
  const partner = members.find((m) => m.user_id !== user!.id);
  const partnerName = partner?.display_name ?? "aguardando parceiro";
  const isSolo = members.length < 2;

  const today = weekdayInBR();
  const allHabits = await getHabits(partnership.id);
  const checkIns = await getTodayCheckIns(partnership.id);

  const activeToday = allHabits.filter((h) => h.active_days.includes(today));
  const myHabitsToday = activeToday.filter((h) => h.user_id === user!.id);
  const partnerHabitsToday = activeToday.filter(
    (h) => h.user_id !== user!.id,
  );

  const partnerCheckIns = partner
    ? checkIns.filter((c) => c.user_id === partner.user_id)
    : [];
  const partnerDone = partnerCheckIns.length;
  const partnerTotal = partnerHabitsToday.length;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <CheckInsRealtime partnershipId={partnership.id} />
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Olá, {displayName}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Hoje</h1>
        </div>
        <LogoutForm />
      </header>

      {isSolo && (
        <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Parceria
          </p>
          <p className="mt-1 text-lg font-medium">{partnership.name}</p>
          <div className="mt-4 rounded-md bg-zinc-50 p-3 dark:bg-zinc-900">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Código de convite
            </p>
            <p className="mt-1 font-mono text-2xl tracking-[0.3em]">
              {partnership.invite_code}
            </p>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Compartilhe esse código com seu parceiro para ele entrar.
            </p>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Seus hábitos hoje</h2>
          <div className="flex gap-2">
            <Link
              href="/placar"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Placar
            </Link>
            <Link
              href="/habitos"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Gerenciar
            </Link>
          </div>
        </div>
        <TodayHabits
          habits={myHabitsToday}
          checkIns={checkIns}
          currentUserId={user!.id}
        />
      </section>

      {!isSolo && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">{partnerName}</h2>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Progresso hoje
            </p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {partnerDone}
              <span className="text-zinc-400 dark:text-zinc-600">
                {" "}
                / {partnerTotal}
              </span>
            </p>
            {partnerTotal === 0 && (
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Seu parceiro não tem hábitos programados pra hoje.
              </p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
