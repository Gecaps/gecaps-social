import type { Metrics } from "./types";

interface MetricsWithTitle extends Metrics {
  title: string;
}

interface RankedPiece extends MetricsWithTitle {
  rank: number;
}

export function rankPieces(metricsWithTitles: MetricsWithTitle[]): RankedPiece[] {
  return [...metricsWithTitles]
    .sort((a, b) => b.engagement_rate - a.engagement_rate)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
}
