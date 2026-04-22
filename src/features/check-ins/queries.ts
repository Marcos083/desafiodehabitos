import { todayInBR } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";

export async function getTodayCheckIns(partnershipId: string) {
  const supabase = await createClient();
  const today = todayInBR();

  const { data, error } = await supabase
    .from("check_ins")
    .select("id, habit_id, user_id, date, completed")
    .eq("partnership_id", partnershipId)
    .eq("date", today);

  if (error) throw error;
  return data;
}
