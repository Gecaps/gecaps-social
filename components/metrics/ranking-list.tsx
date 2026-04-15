"use client";

import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";

interface RankedPiece {
  piece_id: string;
  piece_title: string;
  engagement_rate: number;
  total_interactions: number;
  rank: number;
}

interface RankingListProps {
  rankings: RankedPiece[];
  accountId: string;
}

const RANK_COLORS: Record<number, string> = {
  1: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  2: "bg-gray-400/20 text-gray-300 border-gray-400/30",
  3: "bg-orange-700/20 text-orange-400 border-orange-700/30",
};

function formatInteractions(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

export function RankingList({ rankings, accountId }: RankingListProps) {
  const router = useRouter();

  if (rankings.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-heading font-bold mb-4">
          Ranking de Pecas
        </h2>
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <Trophy className="size-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhuma peca com metricas ainda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-base font-heading font-bold mb-4 px-1">
        Ranking de Pecas
      </h2>
      <div className="space-y-1">
        {rankings.map((item) => {
          const rankColor =
            RANK_COLORS[item.rank] ??
            "bg-muted text-muted-foreground border-border";

          return (
            <button
              key={item.piece_id}
              onClick={() =>
                router.push(`/${accountId}/pecas/${item.piece_id}`)
              }
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
            >
              {/* Rank badge */}
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${rankColor}`}
              >
                {item.rank}
              </span>

              {/* Title */}
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {item.piece_title}
              </span>

              {/* Engagement rate */}
              <span className="shrink-0 text-sm font-heading font-bold text-emerald-400">
                {item.engagement_rate.toFixed(2)}%
              </span>

              {/* Total interactions */}
              <span className="shrink-0 text-xs text-muted-foreground w-12 text-right">
                {formatInteractions(item.total_interactions)} int.
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
