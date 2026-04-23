"use client";

import { Dialog } from "@base-ui/react/dialog";
import { LogOut, Trash2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { signOut } from "@/features/auth/actions";

import { Avatar } from "@/components/shared/Avatar";
import { updateProfile } from "@/features/profile/actions";
import { AvatarCropper } from "@/features/profile/components/AvatarCropper";
import { cn } from "@/lib/utils";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

type ProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  currentAvatarUrl: string | null;
};

type AvatarState =
  | { kind: "current" }
  | { kind: "editing"; src: string; file: File }
  | { kind: "cropped"; blob: Blob; previewUrl: string }
  | { kind: "removed" };

export function ProfileDialog({
  open,
  onOpenChange,
  currentName,
  currentAvatarUrl,
}: ProfileDialogProps) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [avatar, setAvatar] = useState<AvatarState>({ kind: "current" });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [prevOpen, setPrevOpen] = useState(open);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setName(currentName);
      setAvatar({ kind: "current" });
      setError(null);
    }
  }

  useEffect(() => {
    return () => {
      if (avatar.kind === "cropped") URL.revokeObjectURL(avatar.previewUrl);
      if (avatar.kind === "editing") URL.revokeObjectURL(avatar.src);
    };
  }, [avatar]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED_MIME.includes(file.type)) {
      setError("Formato inválido (JPG, PNG ou WebP).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Arquivo maior que 2 MB.");
      return;
    }
    setError(null);
    const src = URL.createObjectURL(file);
    setAvatar({ kind: "editing", src, file });
  }

  function handleCropped(blob: Blob) {
    if (avatar.kind === "editing") URL.revokeObjectURL(avatar.src);
    const previewUrl = URL.createObjectURL(blob);
    setAvatar({ kind: "cropped", blob, previewUrl });
  }

  function handleRemove() {
    setAvatar({ kind: "removed" });
  }

  function handleReset() {
    setAvatar({ kind: "current" });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 40) {
      setError("Nome deve ter entre 1 e 40 caracteres.");
      return;
    }

    const formData = new FormData();
    formData.set("displayName", trimmed);

    if (avatar.kind === "cropped") {
      const file = new File([avatar.blob], "avatar.jpg", {
        type: "image/jpeg",
      });
      formData.set("avatar", file);
    } else if (avatar.kind === "removed") {
      formData.set("removeAvatar", "true");
    }

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.ok) {
        router.refresh();
        onOpenChange(false);
      } else {
        setError(result.error);
      }
    });
  }

  const previewUrl =
    avatar.kind === "cropped"
      ? avatar.previewUrl
      : avatar.kind === "removed"
        ? null
        : currentAvatarUrl;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity" />
        <Dialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-[min(92vw,28rem)] rounded-[20px] border border-border bg-surface p-6 shadow-xl",
            "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[starting-style]:scale-95 transition-[opacity,transform]",
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <Dialog.Title className="text-lg font-medium text-ink">
                Editar perfil
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-muted-foreground">
                Atualize seu nome e foto.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Fechar"
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-bg hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {avatar.kind === "editing" ? (
              <AvatarCropper src={avatar.src} onCropped={handleCropped} />
            ) : (
              <div className="flex items-center gap-4">
                <Avatar
                  name={name}
                  url={previewUrl}
                  size="xl"
                  className="size-16 lg:size-16 lg:text-2xl"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-bg"
                  >
                    <Upload className="size-3.5" />
                    {previewUrl ? "Trocar foto" : "Enviar foto"}
                  </button>
                  {previewUrl && avatar.kind !== "removed" && (
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-bg hover:text-ink"
                    >
                      <Trash2 className="size-3.5" />
                      Remover
                    </button>
                  )}
                  {(avatar.kind === "cropped" || avatar.kind === "removed") && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-bg hover:text-ink"
                    >
                      Desfazer
                    </button>
                  )}
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleFileChange}
            />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="profile-name"
                className="text-xs font-medium text-ink"
              >
                Nome
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                required
                minLength={1}
                className="h-10 rounded-[12px] border border-border bg-surface px-3 text-sm text-ink outline-none transition-colors focus-visible:border-signal focus-visible:ring-2 focus-visible:ring-signal/30"
              />
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {name.trim().length}/40
              </span>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-[12px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2">
              <Dialog.Close className="inline-flex h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-bg">
                Cancelar
              </Dialog.Close>
              <button
                type="submit"
                disabled={pending || avatar.kind === "editing"}
                className="inline-flex h-10 items-center rounded-full bg-ink px-4 text-sm font-medium text-surface transition-colors hover:bg-ink-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>

          <div className="mt-4 border-t border-border pt-4">
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex w-full items-center gap-2 rounded-[12px] px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-bg hover:text-destructive"
              >
                <LogOut className="size-4" />
                Sair da conta
              </button>
            </form>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
