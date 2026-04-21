import { redirect } from "next/navigation";

import { LogoutForm } from "@/features/auth/components/logout-form";
import {
  getCurrentPartnership,
  getPartnershipMembers,
} from "@/features/partnerships/queries";
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

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Olá, {displayName}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Hoje</h1>
        </div>
        <LogoutForm />
      </header>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Parceria
        </p>
        <p className="mt-1 text-lg font-medium">{partnership.name}</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Parceiro: <span className="font-medium">{partnerName}</span>
        </p>
        {isSolo && (
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
        )}
      </section>

      <section className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        Em breve: lista de hábitos para check-in diário.
      </section>
    </main>
  );
}
