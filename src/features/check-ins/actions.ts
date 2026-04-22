"use server";

import { revalidatePath } from "next/cache";

import { todayInBR } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";

export async function toggleCheckIn(habitId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Sessão expirada.");

  const { data: habit, error: habitError } = await supabase
    .from("habits")
    .select("id, partnership_id, user_id")
    .eq("id", habitId)
    .single();

  if (habitError || !habit) throw new Error("Hábito não encontrado.");
  if (habit.user_id !== user.id) {
    throw new Error("Você só pode marcar seus próprios hábitos.");
  }

  const today = todayInBR();

  const { data: existing } = await supabase
    .from("check_ins")
    .select("id")
    .eq("habit_id", habitId)
    .eq("date", today)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("check_ins")
      .delete()
      .eq("id", existing.id);
    if (error) throw new Error("Não foi possível desmarcar.");
  } else {
    const { error } = await supabase.from("check_ins").insert({
      habit_id: habitId,
      partnership_id: habit.partnership_id,
      user_id: user.id,
      date: today,
      completed: true,
    });
    if (error) throw new Error("Não foi possível marcar.");
  }

  revalidatePath("/hoje");
}
