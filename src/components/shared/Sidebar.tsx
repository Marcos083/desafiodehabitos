"use client";

import {
  BarChart3,
  CalendarCheck,
  LayoutDashboard,
  ListChecks,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar } from "@/components/shared/Avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hoje", label: "Hoje", icon: CalendarCheck },
  { href: "/habitos", label: "Hábitos", icon: ListChecks },
  { href: "/parceiro", label: "Parceiro", icon: Users },
  { href: "/placar", label: "Placar", icon: BarChart3 },
];

type SidebarProps = {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  partnershipName?: string | null;
};

export function Sidebar({
  displayName,
  email,
  avatarUrl,
  partnershipName,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 lg:flex">
      <div className="flex items-center gap-2 px-2">
        <div className="flex size-9 items-center justify-center rounded-[12px] bg-signal text-primary-foreground">
          <CalendarCheck className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight text-ink">
            Habit Partner
          </span>
          <span className="text-xs text-muted-foreground leading-tight">
            {partnershipName ?? "sem parceria"}
          </span>
        </div>
      </div>

      <p className="mt-8 px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Geral
      </p>
      <nav className="mt-2 flex flex-col gap-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex h-10 items-center gap-3 rounded-full px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-ink text-surface"
                  : "text-ink/70 hover:bg-bg hover:text-ink",
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  active ? "text-surface" : "text-ink/60",
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-[14px] border border-border bg-bg px-3 py-2">
        <Avatar name={displayName} url={avatarUrl} size="sm" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-ink">
            {displayName}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {email}
          </span>
        </div>
      </div>
    </aside>
  );
}
