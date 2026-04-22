import { redirect } from "next/navigation";

import { MobileNav } from "@/components/shared/MobileNav";
import { Sidebar } from "@/components/shared/Sidebar";
import { Topbar } from "@/components/shared/Topbar";
import { getCurrentPartnership } from "@/features/partnerships/queries";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const partnership = await getCurrentPartnership();

  const displayName = profile?.display_name ?? user.email ?? "você";
  const email = user.email ?? "";

  return (
    <div className="flex min-h-dvh bg-bg">
      <Sidebar
        displayName={displayName}
        email={email}
        partnershipName={partnership?.name}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar displayName={displayName} />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
