import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle, Send } from "lucide-react";

interface StatsCardsProps {
  approved: number;
  pending: number;
  rejected: number;
  published: number;
}

export function StatsCards({
  approved,
  pending,
  rejected,
  published,
}: StatsCardsProps) {
  const cards = [
    {
      label: "Aprovados",
      value: approved,
      icon: CheckCircle2,
      color: "text-neon-cyan",
      bg: "bg-neon-cyan/10",
      glow: "shadow-neon-cyan/5",
    },
    {
      label: "Pendentes",
      value: pending,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      glow: "shadow-amber-400/5",
    },
    {
      label: "Rejeitados",
      value: rejected,
      icon: XCircle,
      color: "text-neon-pink",
      bg: "bg-neon-pink/10",
      glow: "shadow-neon-pink/5",
    },
    {
      label: "Publicados",
      value: published,
      icon: Send,
      color: "text-neon-purple",
      bg: "bg-neon-purple/10",
      glow: "shadow-neon-purple/5",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className={`shadow-lg ${card.glow}`}>
          <CardContent className="flex items-center gap-3 p-4">
            <div
              className={`flex size-10 items-center justify-center rounded-lg ${card.bg}`}
            >
              <card.icon className={`size-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
