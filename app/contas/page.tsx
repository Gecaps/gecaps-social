import Link from "next/link";
import { listAccounts } from "@/modules/accounts/queries";

export default async function ContasPage() {
  const accounts = await listAccounts();

  return (
    <div className="min-h-full bg-background relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
      <div className="pointer-events-none absolute top-1/2 -left-32 h-64 w-64 rounded-full bg-primary/3 blur-3xl dark:bg-primary/8" />

      <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-heading font-extrabold tracking-tight sm:text-4xl">
              Contas
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Selecione uma conta para gerenciar seu conteúdo
            </p>
          </div>
          <Link
            href="/contas/nova"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
            style={{ background: "var(--gradient-primary)" }}
          >
            + Nova conta
          </Link>
        </div>

        {/* Grid */}
        {accounts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">
              Nenhuma conta cadastrada ainda.
            </p>
            <Link
              href="/contas/nova"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              Criar primeira conta
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <Link
                key={account.id}
                href={`/${account.id}/metricas`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/30 dark:hover:shadow-[0_4px_20px_var(--glow-primary)]"
              >
                {/* Avatar */}
                {account.avatar_url ? (
                  <img
                    src={account.avatar_url}
                    alt={account.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/40 transition-all"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-primary/60 text-lg font-bold text-primary-foreground ring-2 ring-primary/20">
                    {account.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Info */}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                    {account.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    @{account.handle}
                  </span>
                  <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                    {account.platform}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
