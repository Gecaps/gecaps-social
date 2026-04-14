export default async function ReferenciasPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-heading font-extrabold tracking-tight">
        Referencias
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Em construcao
      </p>
    </div>
  );
}
