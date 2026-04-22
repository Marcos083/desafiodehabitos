import { createClient } from "@/lib/supabase/server";

export async function getWeekCheckIns(
  partnershipId: string,
  startDate: string,
  endDate: string,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("check_ins")
    .select("habit_id, user_id, date")
    .eq("partnership_id", partnershipId)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) throw error;
  return data;
}
