import { listPieces } from "@/modules/pieces/queries";
import { PipelinePageClient } from "./page-client";

export default async function PipelinePage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const pieces = await listPieces(accountId);

  return <PipelinePageClient accountId={accountId} pieces={pieces} />;
}
