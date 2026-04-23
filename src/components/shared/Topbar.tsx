import { TopbarAvatarButton } from "@/features/profile/components/TopbarAvatarButton";

type TopbarProps = {
  displayName: string;
  avatarUrl: string | null;
};

export function Topbar({ displayName, avatarUrl }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end border-b border-border bg-surface/80 px-4 backdrop-blur-md lg:px-6">
      <TopbarAvatarButton displayName={displayName} avatarUrl={avatarUrl} />
    </header>
  );
}
