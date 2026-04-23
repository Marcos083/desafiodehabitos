"use client";

import { useState } from "react";

import { Avatar } from "@/components/shared/Avatar";
import { ProfileDialog } from "@/features/profile/components/ProfileDialog";

type TopbarAvatarButtonProps = {
  displayName: string;
  avatarUrl: string | null;
};

export function TopbarAvatarButton({
  displayName,
  avatarUrl,
}: TopbarAvatarButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Editar perfil"
        className="rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        <Avatar name={displayName} url={avatarUrl} size="md" />
      </button>
      <ProfileDialog
        open={open}
        onOpenChange={setOpen}
        currentName={displayName}
        currentAvatarUrl={avatarUrl}
      />
    </>
  );
}
