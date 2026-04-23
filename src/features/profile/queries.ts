import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type MyProfile = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
};

export const getMyProfile = cache(async (): Promise<MyProfile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    displayName: profile?.display_name ?? user.email ?? "você",
    avatarUrl: profile?.avatar_url ?? null,
  };
});
