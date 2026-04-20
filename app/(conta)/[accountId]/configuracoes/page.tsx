import { notFound } from "next/navigation";
import { getAccountById } from "@/modules/accounts/queries";
import { SettingsForm } from "@/components/settings/settings-form";

const INTEGRATIONS = [
  {
    key: "CLAUDE_API_KEY",
    label: "Claude (Anthropic)",
    description: "Geração de ideias, legendas e insights.",
  },
  {
    key: "GEMINI_API_KEY",
    label: "Gemini (Nano Banana)",
    description: "Geração e edição de imagens por IA.",
  },
  {
    key: "PERPLEXITY_API_KEY",
    label: "Perplexity",
    description: "Pesquisa de tendências em tempo real.",
  },
  {
    key: "PEXELS_API_KEY",
    label: "Pexels",
    description: "Banco de fotos stock para peças.",
  },
  {
    key: "CF_BROWSER_TOKEN",
    label: "Cloudflare Browser Rendering",
    description: "Renderização HD dos templates.",
  },
  {
    key: "CF_ACCOUNT_ID",
    label: "Cloudflare Account",
    description: "Conta Cloudflare para rendering.",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    label: "Supabase URL",
    description: "Banco de dados e storage.",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    label: "Supabase Service Role",
    description: "Acesso privilegiado ao banco.",
  },
  {
    key: "TELEGRAM_BOT_TOKEN",
    label: "Telegram Bot",
    description: "Notificações de pipeline.",
  },
  {
    key: "TELEGRAM_CHAT_ID",
    label: "Telegram Chat",
    description: "Destino das notificações.",
  },
  {
    key: "TRELLO_API_KEY",
    label: "Trello",
    description: "Sincronização legada com board da Aline.",
  },
  {
    key: "SENTRY_DSN",
    label: "Sentry",
    description: "Monitoramento de erros em produção.",
  },
] as const;

export default async function ConfiguracoesPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const account = await getAccountById(accountId);
  if (!account) notFound();

  const integrations = INTEGRATIONS.map((it) => ({
    ...it,
    configured: !!process.env[it.key],
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold tracking-tight">
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ajuste a conta e verifique integrações.
        </p>
      </header>

      <SettingsForm account={account} integrations={integrations} />
    </div>
  );
}
