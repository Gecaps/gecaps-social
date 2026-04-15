"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  FileText,
  File,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Lightbulb,
  Trash2,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Reference, ReferenceType } from "@/modules/references/types";
import type { Idea } from "@/modules/ideas/types";

interface ReferenceDetailProps {
  reference: Reference;
  ideas: Idea[];
  accountId: string;
}

const typeIcons: Record<ReferenceType, typeof Globe> = {
  link: Globe,
  text: FileText,
  file: File,
  pdf: FileText,
};

const statusLabels: Record<string, string> = {
  novo: "Novo",
  triado: "Triado",
  relevante: "Relevante",
  virou_ideia: "Com ideias",
  usado: "Usado",
  descartado: "Descartado",
  arquivado: "Arquivado",
};

const statusColors: Record<string, string> = {
  novo: "bg-blue-500/10 text-blue-500",
  triado: "bg-purple-500/10 text-purple-500",
  relevante: "bg-emerald-500/10 text-emerald-500",
  virou_ideia: "bg-amber-500/10 text-amber-500",
  usado: "bg-gray-500/10 text-gray-400",
  descartado: "bg-red-500/10 text-red-400",
  arquivado: "bg-gray-500/10 text-gray-500",
};

const ideaStatusLabels: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Rejeitada",
};

const ideaStatusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500",
  approved: "bg-emerald-500/10 text-emerald-500",
  rejected: "bg-red-500/10 text-red-400",
};

function getRelevanceColor(score: number | null): string {
  if (score === null) return "bg-gray-500/10 text-gray-400";
  if (score >= 7) return "bg-emerald-500/10 text-emerald-500";
  if (score >= 4) return "bg-amber-500/10 text-amber-500";
  return "bg-red-500/10 text-red-400";
}

export function ReferenceDetail({
  reference,
  ideas: initialIdeas,
  accountId,
}: ReferenceDetailProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [ref, setRef] = useState<Reference>(reference);

  const Icon = typeIcons[ref.type] || FileText;
  const isProcessed = ref.processed_at !== null;
  const hasIdeas = ideas.length > 0;

  function showSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }

  async function handleProcess() {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/process-reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference_id: ref.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao processar");
      }
      const updated = await res.json();
      setRef(updated);
      showSuccess("Referência processada com sucesso!");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessing(false);
    }
  }

  async function handleGenerateIdeas() {
    setGeneratingIdeas(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference_id: ref.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao gerar ideias");
      }
      const newIdeas = await res.json();
      setIdeas(Array.isArray(newIdeas) ? newIdeas : [newIdeas]);
      showSuccess("Ideias geradas com sucesso!");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGeneratingIdeas(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir esta referência?")) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/references/${ref.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao excluir");
      }
      router.push(`/${accountId}/referencias`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setDeleting(false);
    }
  }

  async function handleIdeaStatus(ideaId: string, status: "approved" | "rejected") {
    setError(null);
    try {
      const res = await fetch(`/api/ideas/${ideaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao atualizar ideia");
      }
      const updated = await res.json();
      setIdeas((prev) =>
        prev.map((idea) => (idea.id === ideaId ? updated : idea))
      );
      showSuccess(
        status === "approved" ? "Ideia aprovada!" : "Ideia rejeitada"
      );
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push(`/${accountId}/referencias`)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Voltar para referências
      </button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
            <Icon className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            {ref.type === "link" && ref.source_url ? (
              <a
                href={ref.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-base font-heading font-medium hover:underline"
              >
                {ref.source_url}
                <ExternalLink className="size-3.5" />
              </a>
            ) : (
              <span className="text-base font-heading font-medium">
                {ref.type === "text"
                  ? "Texto manual"
                  : ref.file_url
                  ? ref.file_url.split("/").pop()
                  : "Referência"}
              </span>
            )}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  statusColors[ref.status] || ""
                }`}
              >
                {statusLabels[ref.status] || ref.status}
              </span>
              {ref.relevance_score !== null && (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getRelevanceColor(
                    ref.relevance_score
                  )}`}
                >
                  Relevância: {ref.relevance_score}/10
                </span>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          Excluir
        </Button>
      </div>

      <Separator />

      {/* Conteudo Original */}
      {ref.raw_content && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conteúdo Original</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-60 rounded-lg border border-border bg-muted/30 p-4">
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans">
                {ref.raw_content}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Resumo IA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ref.summary ? (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {ref.summary}
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground italic">
                Não processado ainda
              </p>
              <Button onClick={handleProcess} disabled={processing} size="sm">
                {processing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Processar com IA
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      {ref.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ref.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sugestoes IA */}
      {(ref.suggested_pilar || ref.suggested_format) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sugestões IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ref.suggested_pilar && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pilar sugerido
                </span>
                <p className="text-sm mt-0.5">{ref.suggested_pilar}</p>
              </div>
            )}
            {ref.suggested_format && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Formato sugerido
                </span>
                <p className="text-sm mt-0.5">{ref.suggested_format}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      {isProcessed && !hasIdeas && (
        <div className="flex gap-3">
          <Button onClick={handleGenerateIdeas} disabled={generatingIdeas}>
            {generatingIdeas ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Gerando ideias...
              </>
            ) : (
              <>
                <Lightbulb className="size-4" />
                Gerar Ideias
              </>
            )}
          </Button>
          {!ref.summary && (
            <Button
              variant="outline"
              onClick={handleProcess}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Processar com IA
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Ideias Geradas */}
      {hasIdeas && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Ideias Geradas ({ideas.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="rounded-xl border border-border p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium">{idea.theme}</h4>
                  <span
                    className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      ideaStatusColors[idea.status] || ""
                    }`}
                  >
                    {ideaStatusLabels[idea.status] || idea.status}
                  </span>
                </div>

                {idea.angle && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Ângulo
                    </span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {idea.angle}
                    </p>
                  </div>
                )}

                {idea.objective && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Objetivo
                    </span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {idea.objective}
                    </p>
                  </div>
                )}

                {idea.suggested_format && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Formato
                    </span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {idea.suggested_format}
                    </p>
                  </div>
                )}

                {idea.justification && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Justificativa
                    </span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {idea.justification}
                    </p>
                  </div>
                )}

                {idea.status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => handleIdeaStatus(idea.id, "approved")}
                    >
                      <Check className="size-3.5" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleIdeaStatus(idea.id, "rejected")}
                    >
                      <X className="size-3.5" />
                      Rejeitar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Toast-like feedback */}
      {success && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
