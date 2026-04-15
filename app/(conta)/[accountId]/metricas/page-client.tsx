"use client";

import { BarChart3 } from "lucide-react";
import { StatsCards } from "@/components/metrics/stats-cards";
import { RankingList } from "@/components/metrics/ranking-list";
import { MetricInput } from "@/components/metrics/metric-input";
import { InsightsPanel } from "@/components/metrics/insights-panel";
import type { Metrics } from "@/modules/metrics/types";
import type { Insight } from "@/modules/insights/types";
import type { Piece } from "@/modules/pieces/types";

interface RankedPiece extends Metrics {
  title: string;
  rank: number;
}

interface MetricasPageClientProps {
  accountId: string;
  metrics: Array<Metrics & { title: string; pilar: string; format: string }>;
  rankings: RankedPiece[];
  insights: Insight[];
  publishedPieces: Piece[];
}

export function MetricasPageClient({
  accountId,
  metrics,
  rankings,
  insights,
  publishedPieces,
}: MetricasPageClientProps) {
  // IDs of pieces that already have metrics
  const piecesWithMetrics = new Set(metrics.map((m) => m.piece_id));

  // Published pieces without metrics (for the input form)
  const piecesWithoutMetrics = publishedPieces.filter(
    (p) => !piecesWithMetrics.has(p.id)
  );

  // Transform metrics for StatsCards (needs piece_title)
  const metricsWithTitle = metrics.map((m) => ({
    ...m,
    piece_title: m.title,
  }));

  // Transform rankings for RankingList
  const rankingItems = rankings.map((r) => ({
    piece_id: r.piece_id,
    piece_title: r.title,
    engagement_rate: r.engagement_rate,
    total_interactions: r.likes + r.comments + r.shares + r.saves,
    rank: r.rank,
  }));

  const hasData = metrics.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold tracking-tight">
          Métricas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Dashboard de performance
        </p>
      </div>

      {!hasData && publishedPieces.length === 0 ? (
        /* Full empty state */
        <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
            <BarChart3 className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Nenhuma métrica ainda</p>
            <p className="text-sm text-muted-foreground mt-1">
              Publique peças e registre métricas para ver o dashboard.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          {hasData && <StatsCards metrics={metricsWithTitle} />}

          {/* Two-column: Ranking + Metric Input */}
          <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
            <RankingList rankings={rankingItems} accountId={accountId} />
            <MetricInput
              publishedPieces={piecesWithoutMetrics}
              accountId={accountId}
            />
          </div>

          {/* Insights Panel */}
          <InsightsPanel insights={insights} accountId={accountId} />
        </div>
      )}
    </div>
  );
}
