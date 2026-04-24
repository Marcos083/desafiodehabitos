"use server";

import { revalidatePath } from "next/cache";

import { addDaysISO, todayInBR } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";

const MAX_DAYS_BACK = 7;

export async function toggleCheckIn(habitId: string, date?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Sessão expirada.");

  const today = todayInBR();
  const targetDate = date ?? today;
  const minDate = addDaysISO(today, -MAX_DAYS_BACK);

  if (targetDate > today) throw new Error("Não é possível marcar datas futuras.");
  if (targetDate < minDate) throw new Error("Só é possível retroativo até 7 dias.");

  const { data: habit, error: habitError } = await supabase
    .from("habits")
    .select("id, partnership_id, user_id")
    .eq("id", habitId)
    .single();

  if (habitError || !habit) throw new Error("Hábito não encontrado.");
  if (habit.user_id !== user.id) {
    throw new Error("Você só pode marcar seus próprios hábitos.");
  }

  const { data: existing } = await supabase
    .from("check_ins")
    .select("id")
    .eq("habit_id", habitId)
    .eq("date", targetDate)
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
      date: targetDate,
      completed: true,
    });
    if (error) throw new Error("Não foi possível marcar.");
  }

  revalidatePath("/hoje");
  revalidatePath("/dashboard");
}
