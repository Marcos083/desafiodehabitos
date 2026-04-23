"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_BYTES = 2 * 1024 * 1024;

const updateSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Informe um nome.")
    .max(40, "Máximo de 40 caracteres."),
});

export type UpdateProfileResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateProfile(
  formData: FormData,
): Promise<UpdateProfileResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Não autenticado." };

  const parsed = updateSchema.safeParse({
    displayName: formData.get("displayName"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const update: { display_name: string; avatar_url?: string | null } = {
    display_name: parsed.data.displayName,
  };

  const avatar = formData.get("avatar");
  const removeAvatar = formData.get("removeAvatar") === "true";

  if (avatar instanceof File && avatar.size > 0) {
    if (!ALLOWED_MIME.includes(avatar.type as (typeof ALLOWED_MIME)[number])) {
      return { ok: false, error: "Formato inválido (JPG, PNG ou WebP)." };
    }
    if (avatar.size > MAX_BYTES) {
      return { ok: false, error: "Arquivo maior que 2 MB." };
    }

    const ext =
      avatar.type === "image/png"
        ? "png"
        : avatar.type === "image/webp"
          ? "webp"
          : "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(path, avatar, {
        cacheControl: "3600",
        contentType: avatar.type,
        upsert: true,
      });
    if (uploadErr) {
      return { ok: false, error: `Falha no upload: ${uploadErr.message}` };
    }

    const { data: publicUrl } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);
    update.avatar_url = publicUrl.publicUrl;
  } else if (removeAvatar) {
    update.avatar_url = null;
  }

  const { error: updateErr } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);
  if (updateErr) return { ok: false, error: updateErr.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
