import { getPlaybookByAccountId } from "@/modules/playbook/queries";
import { PlaybookForm } from "@/components/playbook/playbook-form";

export default async function PlaybookPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const playbook = await getPlaybookByAccountId(accountId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-extrabold tracking-tight">
          Playbook
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Defina o tom, estilo e regras de conteúdo desta conta
        </p>
      </div>
      <PlaybookForm accountId={accountId} playbook={playbook} />
    </div>
  );
}
