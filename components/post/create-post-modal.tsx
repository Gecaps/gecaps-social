"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles, Loader2 } from "lucide-react";
import type { Account, PostPilar, PostLayout } from "@/lib/types";
import { PILAR_LABELS, PILAR_COLORS, LAYOUT_LABELS } from "@/lib/types";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  defaultDate?: string;
  defaultAccountId?: string;
}

const PILARES: PostPilar[] = ["educativo", "autoridade", "produto", "conexao", "social-proof", "objecao"];
const LAYOUTS: PostLayout[] = ["branco", "verde", "quote"];

export function CreatePostModal({ open, onClose, accounts, defaultDate, defaultAccountId }: CreatePostModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);

  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [pilar, setPilar] = useState<PostPilar>("educativo");
  const [layout, setLayout] = useState<PostLayout>("branco");
  const [cta, setCta] = useState("");
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("10:00");
  const [accountId, setAccountId] = useState(defaultAccountId || accounts[0]?.id || "");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");

  if (!open) return null;

  async function handleGenerateCaption() {
    setGeneratingCaption(true);
    try {
      const res = await fetch("/api/posts/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, hook, pilar, cta }),
      });
      if (res.ok) {
        const data = await res.json();
        setCaption(data.caption);
        setHashtags(data.hashtags);
      }
    } finally {
      setGeneratingCaption(false);
    }
  }

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          hook: hook || null,
          pilar,
          layout,
          format: "estatico",
          status: "pending",
          scheduled_date: date,
          scheduled_time: time,
          cta: cta || null,
          caption: caption || null,
          hashtags: hashtags || null,
          account_id: accountId || null,
        }),
      });
      if (res.ok) {
        const post = await res.json();
        onClose();
        router.push(`/post/${post.id}`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-lg my-8">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">
            {step === 1 && "Novo post"}
            {step === 2 && "Estilo e agendamento"}
            {step === 3 && "Legenda"}
          </CardTitle>
          <Button variant="ghost" size="icon-xs" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              {accounts.length > 1 && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Conta</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.handle})</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Titulo *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: 5 coisas que voce precisa saber..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Hook</label>
                <input
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  placeholder="Ex: Qual a diferenca entre..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Pilar</label>
                <div className="flex flex-wrap gap-1.5">
                  {PILARES.map(p => (
                    <button
                      key={p}
                      onClick={() => setPilar(p)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        pilar === p
                          ? PILAR_COLORS[p]
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {PILAR_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">CTA</label>
                <input
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="Ex: Salve para consultar depois"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button onClick={() => setStep(2)} disabled={!title.trim()} className="w-full bg-primary text-primary-foreground">
                Proximo
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Layout</label>
                <div className="flex gap-2">
                  {LAYOUTS.map(l => (
                    <button
                      key={l}
                      onClick={() => setLayout(l)}
                      className={`rounded-lg border px-4 py-2 text-xs font-medium transition-colors ${
                        layout === l
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {LAYOUT_LABELS[l]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Data</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Horario</label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="10:00">10:00</option>
                    <option value="12:00">12:00</option>
                    <option value="15:00">15:00</option>
                    <option value="19:00">19:00</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">Voltar</Button>
                <Button onClick={() => setStep(3)} className="flex-1 bg-primary text-primary-foreground">Proximo</Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Legenda</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateCaption}
                    disabled={generatingCaption}
                    className="text-neon-purple hover:text-neon-purple/80 text-xs h-7"
                  >
                    {generatingCaption ? <Loader2 className="size-3 animate-spin mr-1" /> : <Sparkles className="size-3 mr-1" />}
                    {generatingCaption ? "Gerando..." : "Gerar com IA"}
                  </Button>
                </div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Escreva a legenda ou clique em 'Gerar com IA'..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px] resize-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Hashtags</label>
                <input
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#gecaps #cosmeticos..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(2)} className="flex-1">Voltar</Button>
                <Button onClick={handleCreate} disabled={loading} className="flex-1 bg-primary text-primary-foreground font-semibold">
                  {loading ? "Criando..." : "Criar post"}
                </Button>
              </div>
            </>
          )}

          {/* Step indicator */}
          <div className="flex justify-center gap-1.5 pt-1">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 rounded-full transition-all ${s === step ? "w-6 bg-primary" : "w-2 bg-muted"}`} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
