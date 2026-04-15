import { listIdeas } from "@/modules/ideas/queries";
import { listResearch } from "@/modules/research/queries";
import { IdeasPageClient } from "./page-client";

export default async function IdeiasPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const [ideas, researchSessions] = await Promise.all([
    listIdeas(accountId),
    listResearch(accountId),
  ]);

  return (
    <IdeasPageClient
      accountId={accountId}
      ideas={ideas}
      researchSessions={researchSessions}
    />
  );
}
