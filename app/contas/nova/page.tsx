import { redirect } from "next/navigation";
import { createAccount } from "@/modules/accounts/queries";

export default function NovaContaPage() {
  async function handleCreate(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const handle = formData.get("handle") as string;
    const platform = formData.get("platform") as string;

    if (!name || !handle || !platform) {
      throw new Error("Campos obrigatórios não preenchidos");
    }

    const account = await createAccount({
      name,
      handle,
      platform,
      avatar_url: null,
      active: true,
    });

    redirect(`/${account.id}/playbook`);
  }

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-heading font-extrabold tracking-tight mb-1">
          Nova conta
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Cadastre uma nova conta de rede social
        </p>

        <form action={handleCreate} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium"
            >
              Nome da conta *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Ex: GECAPS Oficial"
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Handle */}
          <div className="space-y-2">
            <label
              htmlFor="handle"
              className="block text-sm font-medium"
            >
              Handle *
            </label>
            <input
              id="handle"
              name="handle"
              type="text"
              required
              placeholder="Ex: gecaps.oficial"
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <label
              htmlFor="platform"
              className="block text-sm font-medium"
            >
              Plataforma *
            </label>
            <select
              id="platform"
              name="platform"
              required
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione...</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              Criar conta
            </button>
            <a
              href="/contas"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
