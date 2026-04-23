import { redirect } from "next/navigation";

import { MobileNav } from "@/components/shared/MobileNav";
import { Sidebar } from "@/components/shared/Sidebar";
import { Topbar } from "@/components/shared/Topbar";
import { getCurrentPartnership } from "@/features/partnerships/queries";
import { getMyProfile } from "@/features/profile/queries";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getMyProfile();
  if (!profile) redirect("/login");

  const partnership = await getCurrentPartnership();

  return (
    <div className="flex min-h-dvh bg-bg">
      <Sidebar
        displayName={profile.displayName}
        email={profile.email}
        avatarUrl={profile.avatarUrl}
        partnershipName={partnership?.name}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          displayName={profile.displayName}
          avatarUrl={profile.avatarUrl}
        />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
