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
  separatorLabel?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Métricas", segment: "metricas", icon: BarChart3 },
  { label: "Calendário", segment: "calendario", icon: Calendar },
  { label: "Pipeline", segment: "pipeline", icon: Kanban },
  { label: "Referências", segment: "referencias", icon: Bookmark, separator: true, separatorLabel: "Conteúdo" },
  { label: "Ideias", segment: "ideias", icon: Lightbulb },
  { label: "Publicados", segment: "publicados", icon: CheckCircle, separator: true, separatorLabel: "Biblioteca" },
  { label: "Playbook", segment: "playbook", icon: BookOpen, separator: true, separatorLabel: "Config" },
  { label: "Configurações", segment: "configuracoes", icon: Settings },
];

interface SidebarProps {
  accounts: Account[];
  currentAccountId: string;
}

export function Sidebar({ accounts, currentAccountId }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 bg-gradient-to-b from-sidebar to-sidebar/95 py-8 px-5 z-50 border-r border-border/50">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-2 px-1">
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
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold px-2.5 py-1 rounded-md ring-1 ring-primary/20 shadow-[0_0_8px_var(--glow-primary)]"
          style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>
          Social
        </span>
      </div>

      {/* Account switcher */}
      <div className="mt-4 mb-2 rounded-xl bg-card/50 p-1.5">
        <AccountSwitcher accounts={accounts} currentId={currentAccountId} />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-y-0.5 mt-4">
        {NAV_ITEMS.map((item) => {
          const href = `/${currentAccountId}/${item.segment}`;
          const isActive =
            pathname === href || pathname.startsWith(href + "/");

          return (
            <div key={item.segment}>
              {item.separator && (
                <div className="mt-4 mb-2 flex items-center gap-2 px-3">
                  <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/60 font-semibold">{item.separatorLabel}</span>
                  <div className="flex-1 h-px bg-border/40" />
                </div>
              )}
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 relative",
                  isActive
                    ? "text-primary font-bold bg-primary/8 border-l-2 border-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className={cn("size-[18px]", isActive && "text-primary")} />
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
          className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground hover:text-primary transition-colors rounded-xl hover:bg-card/60"
        >
          <ArrowLeft className="size-3.5" />
          Todas as contas
        </Link>
      </div>
    </aside>
  );
}
