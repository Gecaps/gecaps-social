"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountSwitcher } from "./account-switcher";
import type { Account } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Calendario", href: "/calendario", icon: Calendar },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Configuracoes", href: "/configuracoes", icon: Settings },
];

interface SidebarProps {
  accounts: Account[];
}

export function Sidebar({ accounts }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 bg-sidebar py-8 px-6 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-2">
        <img
          src="/assets/logo-gecaps.png"
          alt="GECAPS"
          className="h-8 dark:hidden"
        />
        <img
          src="/assets/logo-gecaps-white.png"
          alt="GECAPS"
          className="h-8 hidden dark:block"
        />
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
          Social
        </span>
      </div>

      {/* Account switcher */}
      <div className="mt-4 mb-2">
        <AccountSwitcher accounts={accounts} currentId={null} />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-y-1 mt-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "text-primary font-bold bg-card shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="size-[18px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile at bottom */}
      <div className="mt-auto bg-muted/50 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center text-xs font-bold text-primary-foreground">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold">Aline</span>
            <span className="text-[10px] text-muted-foreground">Social Media</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
