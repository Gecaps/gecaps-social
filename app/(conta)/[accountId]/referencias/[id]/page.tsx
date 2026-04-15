import { notFound } from "next/navigation";
import { getReferenceById } from "@/modules/references/queries";
import { listIdeas } from "@/modules/ideas/queries";
import { ReferenceDetail } from "@/components/references/reference-detail";

export default async function ReferenceDetailPage({
  params,
}: {
  params: Promise<{ accountId: string; id: string }>;
}) {
  const { accountId, id } = await params;

  const reference = await getReferenceById(id);
  if (!reference) {
    notFound();
  }

  const ideas = await listIdeas(accountId, { referenceId: id });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <ReferenceDetail
        reference={reference}
        ideas={ideas}
        accountId={accountId}
      />
    </div>
  );
}
