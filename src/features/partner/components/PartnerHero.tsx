import { Avatar } from "@/components/shared/Avatar";
import { cn } from "@/lib/utils";

type PartnerHeroProps = {
  name: string;
  avatarUrl: string | null;
  joinedAt: string;
  done: number;
  total: number;
  ratio: number;
};

function formatJoinedDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function PartnerHero({
  name,
  avatarUrl,
  joinedAt,
  done,
  total,
  ratio,
}: PartnerHeroProps) {
  const percent = Math.round(ratio * 100);

  return (
    <section className="flex flex-col gap-6 rounded-[20px] border border-border bg-surface p-6 lg:flex-row lg:items-center lg:gap-8 lg:p-8">
      <div className="flex shrink-0 items-center gap-4">
        <Avatar name={name} url={avatarUrl} size="xl" />
        <div className="flex flex-col lg:hidden">
          <h1 className="text-2xl font-medium tracking-tight text-ink">
            {name}
          </h1>
          <p className="text-xs text-muted-foreground">
            Parceiros desde {formatJoinedDate(joinedAt)}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="hidden flex-col lg:flex">
          <h1 className="text-3xl font-medium tracking-tight text-ink">
            {name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Parceiros desde {formatJoinedDate(joinedAt)}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Hoje
            </span>
            <span className="text-sm text-ink tabular-nums">
              {total === 0 ? (
                <span className="text-muted-foreground">sem hábitos hoje</span>
              ) : (
                <>
                  <span className="font-medium">{done}</span>
                  <span className="text-muted-foreground"> / {total}</span>
                  <span className="ml-2 text-muted-foreground">
                    ({percent}%)
                  </span>
                </>
              )}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-bg">
            <div
              className={cn(
                "h-full rounded-full bg-signal transition-all",
                total === 0 && "opacity-20",
              )}
              style={{ width: `${total === 0 ? 0 : percent}%` }}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-surface transition-colors hover:bg-ink-2 lg:self-center"
      >
        Enviar <span aria-hidden>🔥</span>
      </button>
    </section>
  );
}
