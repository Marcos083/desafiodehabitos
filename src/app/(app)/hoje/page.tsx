import { LogoutForm } from "@/features/auth/components/logout-form";
import { createClient } from "@/lib/supabase/server";

export default async function HojePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user!.id)
    .single();

  const displayName = profile?.display_name ?? user!.email ?? "você";

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

      <section className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        Em breve: lista de hábitos para check-in diário.
      </section>
    </main>
  );
}
