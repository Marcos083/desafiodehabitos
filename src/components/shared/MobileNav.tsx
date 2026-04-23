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

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hoje", label: "Hoje", icon: CalendarCheck },
  { href: "/habitos", label: "Hábitos", icon: ListChecks },
  { href: "/parceiro", label: "Parceiro", icon: Users },
  { href: "/placar", label: "Placar", icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-30 flex h-16 items-center justify-around border-t border-border bg-surface/95 px-2 backdrop-blur-md lg:hidden">
      {navItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={cn(
              "flex size-11 items-center justify-center rounded-full transition-colors",
              active
                ? "bg-signal text-primary-foreground"
                : "text-ink/60 hover:text-ink",
            )}
          >
            <Icon className="size-5" />
            <span className="sr-only">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
