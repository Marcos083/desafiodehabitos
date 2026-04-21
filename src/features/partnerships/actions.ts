"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

type FormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

const createSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome muito curto.")
    .max(80, "Nome muito longo."),
});

const joinSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .length(6, "Código tem 6 caracteres."),
});

export async function createPartnership(
  _prev: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const parsed = createSchema.safeParse({ name: formData.get("name") });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]!.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_partnership", {
    p_name: parsed.data.name,
  });

  if (error) {
    return {
      status: "error",
      message: "Não foi possível criar a parceria. Tente novamente.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/hoje");
}

export async function joinPartnership(
  _prev: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const parsed = joinSchema.safeParse({ code: formData.get("code") });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]!.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("join_partnership", {
    p_invite_code: parsed.data.code,
  });

  if (error) {
    return {
      status: "error",
      message:
        "Código inválido, expirado ou já usado. Confira com seu parceiro.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/hoje");
}
