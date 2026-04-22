"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentPartnership } from "@/features/partnerships/queries";
import { createClient } from "@/lib/supabase/server";

type FormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

const habitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome muito curto.")
    .max(80, "Nome muito longo."),
  description: z
    .string()
    .trim()
    .max(280, "Descrição muito longa.")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  active_days: z
    .array(z.number().int().min(0).max(6))
    .min(1, "Escolha pelo menos um dia."),
});

function parseFormData(formData: FormData) {
  const activeDays = formData
    .getAll("active_days")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n));

  return habitSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
    active_days: activeDays,
  });
}

export async function createHabit(
  _prev: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseFormData(formData);

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]!.message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sessão expirada." };
  }

  const partnership = await getCurrentPartnership();
  if (!partnership) {
    return { status: "error", message: "Nenhuma parceria ativa." };
  }

  const { error } = await supabase.from("habits").insert({
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    active_days: parsed.data.active_days,
    partnership_id: partnership.id,
    user_id: user.id,
  });

  if (error) {
    return {
      status: "error",
      message: "Não foi possível criar o hábito. Tente novamente.",
    };
  }

  revalidatePath("/habitos");
  redirect("/habitos");
}

export async function updateHabit(
  _prev: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const habitId = formData.get("id");
  if (typeof habitId !== "string" || habitId.length === 0) {
    return { status: "error", message: "Hábito inválido." };
  }

  const parsed = parseFormData(formData);

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]!.message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      active_days: parsed.data.active_days,
    })
    .eq("id", habitId);

  if (error) {
    return {
      status: "error",
      message: "Não foi possível atualizar o hábito.",
    };
  }

  revalidatePath("/habitos");
  redirect("/habitos");
}

export async function archiveHabit(habitId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .update({ archived_at: new Date().toISOString(), is_active: false })
    .eq("id", habitId);

  if (error) {
    throw new Error("Não foi possível arquivar o hábito.");
  }

  revalidatePath("/habitos");
}
