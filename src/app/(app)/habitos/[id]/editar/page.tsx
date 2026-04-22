import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HabitForm } from "@/features/habits/components/habit-form";
import { getHabit } from "@/features/habits/queries";
import { getCurrentPartnership } from "@/features/partnerships/queries";
import { createClient } from "@/lib/supabase/server";

export default async function EditarHabitoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const partnership = await getCurrentPartnership();
  if (!partnership) redirect("/onboarding");

  const habit = await getHabit(id);
  if (!habit) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (habit.user_id !== user!.id) {
    redirect("/habitos");
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-10">
      <div>
        <Link
          href="/habitos"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          ← Voltar
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Editar hábito</CardTitle>
          <CardDescription>
            Ajuste o nome, descrição e dias da semana.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HabitForm
            habit={{
              id: habit.id,
              name: habit.name,
              description: habit.description,
              active_days: habit.active_days,
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
