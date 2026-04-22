import { listIdeas } from "@/modules/ideas/queries";
import { listResearch } from "@/modules/research/queries";
import { listPiecesByIdeaIds } from "@/modules/pieces/queries";
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

  const piecesMap = await listPiecesByIdeaIds(ideas.map((i) => i.id));
  const pieceByIdeaId: Record<string, { id: string; status: string }> = {};
  for (const [ideaId, piece] of piecesMap.entries()) {
    pieceByIdeaId[ideaId] = { id: piece.id, status: piece.status };
  }

  return (
    <IdeasPageClient
      accountId={accountId}
      ideas={ideas}
      researchSessions={researchSessions}
      pieceByIdeaId={pieceByIdeaId}
    />
  );
}
