import { UserPlus } from "lucide-react";

import { Avatar } from "@/components/shared/Avatar";

type PartnerCardProps = {
  partnerName: string | null;
  partnerAvatarUrl: string | null;
  lastCheckInHabit: string | null;
  doneToday: number;
  totalToday: number;
};

export function PartnerCard({
  partnerName,
  partnerAvatarUrl,
  lastCheckInHabit,
  doneToday,
  totalToday,
}: PartnerCardProps) {
  if (!partnerName) {
    return (
      <div className="flex flex-col gap-4 rounded-[20px] border border-border bg-surface p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Parceiro
        </p>
        <div className="flex flex-col items-start gap-2">
          <div className="flex size-12 items-center justify-center rounded-full bg-signal-faint text-signal">
            <UserPlus className="size-5" />
          </div>
          <p className="text-sm text-ink">Aguardando parceiro</p>
          <p className="text-xs text-muted-foreground">
            Compartilhe seu código de convite para iniciar a parceria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-border bg-surface p-5">
      <div className="flex items-center gap-3">
        <Avatar name={partnerName} url={partnerAvatarUrl} size="lg" />
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-sm font-medium text-ink">{partnerName}</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {doneToday} de {totalToday} hoje
          </p>
        </div>
      </div>

      <div className="rounded-[14px] bg-bg p-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Último check-in
        </p>
        <p className="mt-1 truncate text-sm text-ink">
          {lastCheckInHabit ?? "Nada ainda hoje"}
        </p>
      </div>

      <button
        type="button"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-ink text-sm font-medium text-surface transition-colors hover:bg-ink-2"
      >
        Enviar <span aria-hidden>🔥</span>
      </button>
    </div>
  );
}
