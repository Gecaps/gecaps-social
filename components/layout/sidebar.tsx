"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Kanban,
  Bookmark,
  Lightbulb,
  CheckCircle,
  BookOpen,
  Settings,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountSwitcher } from "./account-switcher";
import type { Account } from "@/modules/accounts/types";

interface NavItem {
  label: string;
  segment: string;
  icon: LucideIcon;
  separator?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Metricas", segment: "metricas", icon: BarChart3 },
  { label: "Calendario", segment: "calendario", icon: Calendar },
  { label: "Pipeline", segment: "pipeline", icon: Kanban },
  { label: "Referencias", segment: "referencias", icon: Bookmark, separator: true },
  { label: "Ideias", segment: "ideias", icon: Lightbulb },
  { label: "Publicados", segment: "publicados", icon: CheckCircle, separator: true },
  { label: "Playbook", segment: "playbook", icon: BookOpen, separator: true },
  { label: "Configuracoes", segment: "configuracoes", icon: Settings },
];

interface SidebarProps {
  accounts: Account[];
  currentAccountId: string;
}

export function Sidebar({ accounts, currentAccountId }: SidebarProps) {
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
        <AccountSwitcher accounts={accounts} currentId={currentAccountId} />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-y-1 mt-4">
        {NAV_ITEMS.map((item) => {
          const href = `/${currentAccountId}/${item.segment}`;
          const isActive =
            pathname === href || pathname.startsWith(href + "/");

          return (
            <div key={item.segment}>
              {item.separator && (
                <div className="my-2 h-px bg-border/50" />
              )}
              <Link
                href={href}
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
            </div>
          );
        })}
      </nav>

      {/* Back to all accounts */}
      <div className="mt-auto">
        <Link
          href="/contas"
          className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Todas as contas
        </Link>
      </div>
    </aside>
  );
}
