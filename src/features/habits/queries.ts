import { createClient } from "@/lib/supabase/server";

export async function getHabits(partnershipId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("habits")
    .select(
      "id, name, description, active_days, frequency_type, is_active, points, user_id, created_at, archived_at",
    )
    .eq("partnership_id", partnershipId)
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}
