import { listIdeas } from "@/modules/ideas/queries";
import { IdeasPageClient } from "./page-client";

export default async function IdeiasPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const ideas = await listIdeas(accountId);

  return <IdeasPageClient accountId={accountId} ideas={ideas} />;
}
