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

const createSchema = z.object({
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

export async function createHabit(
  _prev: FormState | null,
  formData: FormData,
): Promise<FormState> {
  const activeDays = formData
    .getAll("active_days")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n));

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
    active_days: activeDays,
  });

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
