import { listPieces } from "@/modules/pieces/queries";
import { CalendarioPageClient } from "./page-client";

export default async function CalendarioPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const pieces = await listPieces(accountId);

  return <CalendarioPageClient accountId={accountId} pieces={pieces} />;
}
