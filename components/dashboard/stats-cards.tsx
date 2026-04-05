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
      color: "text-status-approved",
      bg: "bg-status-approved/10",
    },
    {
      label: "Pendentes",
      value: pending,
      icon: Clock,
      color: "text-status-pending",
      bg: "bg-status-pending/10",
    },
    {
      label: "Rejeitados",
      value: rejected,
      icon: XCircle,
      color: "text-status-rejected",
      bg: "bg-status-rejected/10",
    },
    {
      label: "Publicados",
      value: published,
      icon: Send,
      color: "text-status-published",
      bg: "bg-status-published/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
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
