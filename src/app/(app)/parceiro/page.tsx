import { UserPlus } from "lucide-react";
import { redirect } from "next/navigation";

import { CheckInsRealtime } from "@/features/check-ins/components/check-ins-realtime";
import { PartnerActivity } from "@/features/partner/components/PartnerActivity";
import { PartnerHabits } from "@/features/partner/components/PartnerHabits";
import { PartnerHero } from "@/features/partner/components/PartnerHero";
import { PartnerStats } from "@/features/partner/components/PartnerStats";
import { PartnershipInfo } from "@/features/partner/components/PartnershipInfo";
import { getPartnerPageData } from "@/features/partner/queries";
import { getCurrentPartnership } from "@/features/partnerships/queries";
import { createClient } from "@/lib/supabase/server";

export default async function ParceiroPage() {
  const partnership = await getCurrentPartnership();
  if (!partnership) redirect("/onboarding");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const data = await getPartnerPageData({
    partnership,
    userId: user!.id,
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <CheckInsRealtime partnershipId={partnership.id} />

      {data.hasPartner && data.partner ? (
        <>
          <PartnerHero
            name={data.partner.name}
            avatarUrl={data.partner.avatarUrl}
            joinedAt={data.partner.joinedAt}
            done={data.today.done}
            total={data.today.total}
            ratio={data.today.ratio}
          />

          <PartnerStats
            currentStreak={data.stats.currentStreak}
            pointsThisWeek={data.stats.pointsThisWeek}
            completionRate30d={data.stats.completionRate30d}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <PartnerHabits habits={data.habits} />
            <PartnerActivity items={data.activity} />
          </div>

          <PartnershipInfo
            name={data.partnership.name}
            inviteCode={data.partnership.inviteCode}
          />
        </>
      ) : (
        <section className="flex flex-col items-center gap-3 rounded-[20px] border border-border bg-surface p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-signal-faint text-signal">
            <UserPlus className="size-6" />
          </div>
          <h1 className="text-xl font-medium text-ink">
            Aguardando parceiro
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Compartilhe o código de convite abaixo para iniciar a parceria.
          </p>
          <div className="mt-2 w-full max-w-xs">
            <PartnershipInfo
              name={data.partnership.name}
              inviteCode={data.partnership.inviteCode}
            />
          </div>
        </section>
      )}
    </div>
  );
}
