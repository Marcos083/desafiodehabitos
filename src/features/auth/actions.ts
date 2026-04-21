"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
});

export type SendMagicLinkResult =
  | { status: "success" }
  | { status: "error"; message: string };

export async function sendMagicLink(
  _prev: SendMagicLinkResult | null,
  formData: FormData,
): Promise<SendMagicLinkResult> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", message: "Email inválido" };
  }

  const headersList = await headers();
  const origin =
    headersList.get("origin") ??
    (headersList.get("host")
      ? `${headersList.get("x-forwarded-proto") ?? "http"}://${headersList.get("host")}`
      : "http://localhost:3000");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return { status: "success" };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
