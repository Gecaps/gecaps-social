"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Kanban,
  Bookmark,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  segment: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Métricas", segment: "metricas", icon: BarChart3 },
  { label: "Calendário", segment: "calendario", icon: Calendar },
  { label: "Pipeline", segment: "pipeline", icon: Kanban },
  { label: "Refs", segment: "referencias", icon: Bookmark },
  { label: "Playbook", segment: "playbook", icon: BookOpen },
];

interface BottomNavProps {
  accountId: string;
}

export function BottomNav({ accountId }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-card/95 backdrop-blur-sm lg:hidden">
      {NAV_ITEMS.map((item) => {
        const href = `/${accountId}/${item.segment}`;
        const isActive =
          pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={item.segment}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
