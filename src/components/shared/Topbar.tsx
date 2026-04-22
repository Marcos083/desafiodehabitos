"use client";

import { Bell, Moon, Search } from "lucide-react";

type TopbarProps = {
  displayName: string;
  notificationCount?: number;
};

export function Topbar({ displayName, notificationCount = 0 }: TopbarProps) {
  const initial = displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-md lg:px-6">
      <div className="flex flex-1 items-center justify-center">
        <label className="relative flex w-full max-w-xl items-center">
          <Search className="pointer-events-none absolute left-4 size-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar hábitos, check-ins..."
            className="h-10 w-full rounded-full border border-border bg-bg pl-11 pr-4 text-sm text-ink placeholder:text-muted-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Alternar tema"
          className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-ink/70 transition-colors hover:bg-bg hover:text-ink"
        >
          <Moon className="size-4" />
        </button>

        <button
          type="button"
          aria-label="Notificações"
          className="relative flex size-10 items-center justify-center rounded-full border border-border bg-surface text-ink/70 transition-colors hover:bg-bg hover:text-ink"
        >
          <Bell className="size-4" />
          {notificationCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-signal text-[10px] font-semibold text-primary-foreground ring-2 ring-surface">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>

        <div className="flex size-10 items-center justify-center rounded-full bg-signal-faint text-sm font-semibold text-ink">
          {initial}
        </div>
      </div>
    </header>
  );
}
