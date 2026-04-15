import { listMetricsByAccount } from "@/modules/metrics/queries";
import { rankPieces } from "@/modules/metrics/ranking";
import { listInsights } from "@/modules/insights/queries";
import { listPieces } from "@/modules/pieces/queries";
import { MetricasPageClient } from "./page-client";

export default async function MetricasPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;

  const [metrics, insights, publishedPieces] = await Promise.all([
    listMetricsByAccount(accountId),
    listInsights(accountId),
    listPieces(accountId, { status: "published" }),
  ]);

  const rankings = rankPieces(metrics);

  return (
    <MetricasPageClient
      accountId={accountId}
      metrics={metrics}
      rankings={rankings}
      insights={insights}
      publishedPieces={publishedPieces}
    />
  );
}
