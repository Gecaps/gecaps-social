"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  BrainCircuit,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Insight } from "@/modules/insights/types";

interface InsightsPanelProps {
  insights: Insight[];
  accountId: string;
}

function InsightCard({ insight }: { insight: Insight }) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(insight.content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSave() {
    if (content.trim() === insight.content) {
      setEditing(false);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/insights/${insight.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar");
      }

      setEditing(false);
    } catch (err) {
      setError((err as Error).message);
      setTimeout(() => setError(null), 4000);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setContent(insight.content);
    setEditing(false);
  }

  const date = new Date(insight.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      {/* Header: badges + date */}
      <div className="flex items-center gap-2 flex-wrap">
        {insight.type === "auto" ? (
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]"
          >
            <Sparkles className="size-3 mr-0.5" />
            Auto
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-gray-500/10 text-gray-400 border-gray-500/20 text-[10px]"
          >
            Manual
          </Badge>
        )}
        {insight.is_edited && (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]"
          >
            Editado
          </Badge>
        )}
        <span className="ml-auto text-[10px] text-muted-foreground">
          {date}
        </span>
      </div>

      {/* Content: editable */}
      {editing ? (
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 min-h-20 resize-none dark:bg-input/30"
            autoFocus
          />
          <div className="flex gap-1.5">
            <Button
              size="xs"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Check className="size-3" />
              )}
              Salvar
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
            >
              <X className="size-3" />
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="group/edit w-full text-left"
        >
          <p className="text-sm leading-relaxed text-foreground/90">
            {content}
            <Pencil className="inline-block size-3 ml-1.5 text-muted-foreground opacity-0 group-hover/edit:opacity-100 transition-opacity" />
          </p>
        </button>
      )}

      {error && (
        <p className="text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}

export function InsightsPanel({ insights, accountId }: InsightsPanelProps) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/generate-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_id: accountId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao gerar insights");
      }

      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="size-5 text-purple-400" />
          <h2 className="text-base font-heading font-bold">Insights IA</h2>
        </div>
        <Button
          size="sm"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="size-3.5" />
              Gerar Insights
            </>
          )}
        </Button>
      </div>

      {error && (
        <p className="text-xs font-medium text-red-500">{error}</p>
      )}

      {/* Insights list */}
      {insights.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-2">
          <BrainCircuit className="size-6 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">
            Nenhum insight ainda. Registre métricas em peças publicadas e clique
            em &quot;Gerar Insights&quot;.
          </p>
        </div>
      )}
    </div>
  );
}
