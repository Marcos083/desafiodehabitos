import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { HabitsList } from "@/features/habits/components/habits-list";
import { getHabits } from "@/features/habits/queries";
import { getCurrentPartnership } from "@/features/partnerships/queries";

export default async function HabitosPage() {
  const partnership = await getCurrentPartnership();

  if (!partnership) {
    redirect("/onboarding");
  }

  const habits = await getHabits(partnership.id);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="flex items-center justify-between">
        <div>
          <Link
            href="/hoje"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            ← Voltar
          </Link>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Meus hábitos
          </h1>
        </div>
        <Link href="/habitos/novo" className={buttonVariants()}>
          Novo hábito
        </Link>
      </header>

      <HabitsList habits={habits} />
    </main>
  );
}
