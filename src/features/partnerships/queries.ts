import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export const getCurrentPartnership = cache(async () => {
  const supabase = await createClient();

  const { data: membership, error: membershipError } = await supabase
    .from("partnership_members")
    .select("partnership_id, role")
    .limit(1)
    .maybeSingle();

  if (membershipError) throw membershipError;
  if (!membership) return null;

  const { data: partnership, error: partnershipError } = await supabase
    .from("partnerships")
    .select("id, name, invite_code, created_at")
    .eq("id", membership.partnership_id)
    .single();

  if (partnershipError) throw partnershipError;
  if (!partnership) return null;

  return {
    role: membership.role,
    id: partnership.id,
    name: partnership.name,
    invite_code: partnership.invite_code,
    created_at: partnership.created_at,
  };
});

export async function getPartnershipMembers(partnershipId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("partnership_members")
    .select("user_id, role, joined_at, profiles!inner(display_name, avatar_url)")
    .eq("partnership_id", partnershipId);

  if (error) throw error;
  return data.map((m) => ({
    user_id: m.user_id,
    role: m.role,
    joined_at: m.joined_at,
    display_name: m.profiles.display_name,
    avatar_url: m.profiles.avatar_url,
  }));
}
