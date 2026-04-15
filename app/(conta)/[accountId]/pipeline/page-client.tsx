"use client";

import {
  Layers,
  Paintbrush,
  CheckCircle2,
  CalendarCheck,
  Globe,
} from "lucide-react";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import type { Piece } from "@/modules/pieces/types";

interface PipelinePageClientProps {
  accountId: string;
  pieces: Piece[];
}

export function PipelinePageClient({
  accountId,
  pieces,
}: PipelinePageClientProps) {
  const total = pieces.length;
  const inProduction = pieces.filter(
    (p) => p.status === "in_production"
  ).length;
  const finalApproved = pieces.filter(
    (p) => p.status === "final_approved"
  ).length;
  const scheduled = pieces.filter((p) => p.status === "scheduled").length;
  const published = pieces.filter((p) => p.status === "published").length;

  const stats = [
    { label: "Total", value: total, icon: Layers },
    { label: "Em Produção", value: inProduction, icon: Paintbrush },
    { label: "Aprovados", value: finalApproved, icon: CheckCircle2 },
    { label: "Agendados", value: scheduled, icon: CalendarCheck },
    { label: "Publicados", value: published, icon: Globe },
  ];

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold tracking-tight">
          Pipeline
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kanban de produção de conteúdo
        </p>
      </div>

      {total > 0 ? (
        <>
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-3 text-center"
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <stat.icon className="size-3.5 text-muted-foreground" />
                  <p className="text-lg font-heading font-bold">
                    {stat.value}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Board */}
          <PipelineBoard pieces={pieces} accountId={accountId} />
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
            <Layers className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Nenhuma peça no pipeline</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crie ideias e aprove-as para ver peças aqui.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
