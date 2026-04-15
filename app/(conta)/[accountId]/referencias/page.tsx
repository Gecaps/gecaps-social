import { listReferences } from "@/modules/references/queries";
import { ReferencesPageClient } from "./page-client";

export default async function ReferenciasPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const references = await listReferences(accountId);

  return <ReferencesPageClient accountId={accountId} references={references} />;
}
