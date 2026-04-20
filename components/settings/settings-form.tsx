"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Account } from "@/modules/accounts/types";
import { Loader2, Save, CheckCircle2, XCircle, Power } from "lucide-react";

interface IntegrationStatus {
  key: string;
  label: string;
  description: string;
  configured: boolean;
}

interface Props {
  account: Account;
  integrations: IntegrationStatus[];
}

export function SettingsForm({ account, integrations }: Props) {
  const router = useRouter();
  const [name, setName] = useState(account.name);
  const [handle, setHandle] = useState(account.handle);
  const [platform, setPlatform] = useState(account.platform);
  const [active, setActive] = useState(account.active);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function show(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, handle, platform, active }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Erro ao salvar");
      }
      show("success", "Configurações salvas!");
      router.refresh();
    } catch (err) {
      show("error", (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
            feedback.type === "success"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/15 text-red-400 border border-red-500/20"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <section className="rounded-2xl border border-border bg-card p-6">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Perfil da conta</h2>
            <p className="text-sm text-muted-foreground">
              Como esta conta aparece no painel e nos posts.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[var(--accent-violet,oklch(0.65_0.2_300))] px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Salvar
          </button>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">
              Nome
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">
              Handle
            </span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@usuario"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">
              Plataforma
            </span>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
              <option value="x">X / Twitter</option>
            </select>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-border bg-background/60 px-3 py-2 text-sm">
            <Power className="size-4 text-muted-foreground" />
            <span className="flex-1">Conta ativa</span>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="size-4 accent-primary"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <header className="mb-5">
          <h2 className="text-lg font-semibold">Integrações</h2>
          <p className="text-sm text-muted-foreground">
            Status das chaves configuradas no servidor.
          </p>
        </header>

        <ul className="divide-y divide-border">
          {integrations.map((it) => (
            <li
              key={it.key}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              {it.configured ? (
                <CheckCircle2 className="size-5 text-emerald-400" />
              ) : (
                <XCircle className="size-5 text-red-400" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{it.label}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {it.description}
                </div>
              </div>
              <code className="text-[11px] text-muted-foreground font-mono">
                {it.key}
              </code>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
