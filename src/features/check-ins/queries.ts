import { createClient } from "@/lib/supabase/server";

export async function getCheckInsForDate(
  partnershipId: string,
  date: string,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("check_ins")
    .select("id, habit_id, user_id, date, completed")
    .eq("partnership_id", partnershipId)
    .eq("date", date);

  if (error) throw error;
  return data;
}

/** @deprecated use getCheckInsForDate */
export async function getTodayCheckIns(partnershipId: string) {
  const { todayInBR } = await import("@/lib/date");
  return getCheckInsForDate(partnershipId, todayInBR());
}
