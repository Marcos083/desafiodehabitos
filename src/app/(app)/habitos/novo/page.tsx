import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HabitForm } from "@/features/habits/components/habit-form";
import { getCurrentPartnership } from "@/features/partnerships/queries";

export default async function NovoHabitoPage() {
  const partnership = await getCurrentPartnership();

  if (!partnership) {
    redirect("/onboarding");
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
          <CardTitle>Novo hábito</CardTitle>
          <CardDescription>
            Defina um hábito claro e os dias da semana que quer praticar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HabitForm />
        </CardContent>
      </Card>
    </main>
  );
}
