import { listPieces } from "@/modules/pieces/queries";
import { listMetricsByAccount } from "@/modules/metrics/queries";
import { PublicadosPageClient } from "./page-client";

export default async function PublicadosPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;

  const [pieces, metrics] = await Promise.all([
    listPieces(accountId, { status: "published" }),
    listMetricsByAccount(accountId),
  ]);

  // Build a map of piece_id -> Metrics for quick lookup
  const metricsMap: Record<string, (typeof metrics)[number]> = {};
  for (const m of metrics) {
    metricsMap[m.piece_id] = m;
  }

  return (
    <PublicadosPageClient
      accountId={accountId}
      pieces={pieces}
      metricsMap={metricsMap}
    />
  );
}
