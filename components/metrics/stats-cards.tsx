"use client";

import {
  BarChart3,
  Eye,
  Heart,
  FileCheck,
} from "lucide-react";
import type { Metrics } from "@/modules/metrics/types";

interface StatsCardsProps {
  metrics: Array<Metrics & { piece_title: string }>;
}

interface StatCard {
  label: string;
  value: string;
  icon: React.ReactNode;
  borderColor: string;
  iconBg: string;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString("pt-BR");
}

export function StatsCards({ metrics }: StatsCardsProps) {
  const totalPublished = metrics.length;

  const avgEngagement =
    metrics.length > 0
      ? (
          metrics.reduce((acc, m) => acc + m.engagement_rate, 0) /
          metrics.length
        ).toFixed(2)
      : "0";

  const totalReach = metrics.reduce((acc, m) => acc + m.reach, 0);

  const totalInteractions = metrics.reduce(
    (acc, m) => acc + m.likes + m.comments + m.shares + m.saves,
    0
  );

  const cards: StatCard[] = [
    {
      label: "Peças publicadas",
      value: String(totalPublished),
      icon: <FileCheck className="size-5" />,
      borderColor: "border-l-indigo-500",
      iconBg: "bg-indigo-500/10 text-indigo-400",
    },
    {
      label: "Média de engagement",
      value: avgEngagement + "%",
      icon: <BarChart3 className="size-5" />,
      borderColor: "border-l-emerald-500",
      iconBg: "bg-emerald-500/10 text-emerald-400",
    },
    {
      label: "Total de alcance",
      value: formatNumber(totalReach),
      icon: <Eye className="size-5" />,
      borderColor: "border-l-amber-500",
      iconBg: "bg-amber-500/10 text-amber-400",
    },
    {
      label: "Total de interações",
      value: formatNumber(totalInteractions),
      icon: <Heart className="size-5" />,
      borderColor: "border-l-pink-500",
      iconBg: "bg-pink-500/10 text-pink-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border border-border bg-card p-4 border-l-4 ${card.borderColor}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}
            >
              {card.icon}
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-heading font-bold tracking-tight">
                {card.value}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {card.label}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
