import { notFound } from "next/navigation";
import { getPieceById, listVersions } from "@/modules/pieces/queries";
import { PieceEditor } from "@/components/pieces/piece-editor";

export default async function PieceEditorPage({
  params,
}: {
  params: Promise<{ accountId: string; id: string }>;
}) {
  const { accountId, id } = await params;

  const piece = await getPieceById(id);
  if (!piece) {
    notFound();
  }

  const versions = await listVersions(id);

  return (
    <PieceEditor piece={piece} versions={versions} accountId={accountId} />
  );
}
