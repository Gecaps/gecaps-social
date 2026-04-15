"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  X,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  PenLine,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Idea, IdeaStatus } from "@/modules/ideas/types";

interface IdeaCardProps {
  idea: Idea;
  accountId: string;
}

const statusLabels: Record<IdeaStatus, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Rejeitada",
};

const statusColors: Record<IdeaStatus, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

const formatLabels: Record<string, string> = {
  estatico: "Estático",
  carrossel: "Carrossel",
  story: "Story",
  reels: "Reels",
};

const formatColors: Record<string, string> = {
  estatico: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  carrossel: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  story: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  reels: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

export function IdeaCard({ idea, accountId }: IdeaCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function showSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }

  function showError(msg: string) {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  }

  async function handleStatusChange(status: "approved" | "rejected") {
    setLoading(status);
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao atualizar");
      }
      showSuccess(status === "approved" ? "Ideia aprovada!" : "Ideia rejeitada");
      router.refresh();
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setLoading(null);
    }
  }

  async function handleGeneratePiece() {
    setLoading("generate");
    try {
      const res = await fetch("/api/ai/generate-piece", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea_id: idea.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao gerar peça");
      }
      showSuccess("Peça gerada com sucesso!");
      router.refresh();
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="transition-all hover:ring-2 hover:ring-primary/30 hover:shadow-[0_0_12px_var(--glow-primary)]">
      <CardContent className="space-y-3">
        {/* Header: theme + status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold leading-tight line-clamp-2">
            {idea.theme}
          </h3>
          <Badge
            variant="outline"
            className={`shrink-0 text-[10px] ${statusColors[idea.status]}`}
          >
            {statusLabels[idea.status]}
          </Badge>
        </div>

        {/* Angle */}
        {idea.angle && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {idea.angle}
          </p>
        )}

        {/* Objective */}
        {idea.objective && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {idea.objective}
          </p>
        )}

        {/* Badges: format + source */}
        <div className="flex flex-wrap items-center gap-1.5">
          {idea.suggested_format && (
            <Badge
              variant="outline"
              className={`text-[10px] ${formatColors[idea.suggested_format] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}
            >
              {formatLabels[idea.suggested_format] || idea.suggested_format}
            </Badge>
          )}
          {idea.research_id ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-violet-400">
              <Search className="size-3" />
              Via pesquisa
            </span>
          ) : idea.reference_id ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <LinkIcon className="size-3" />
              Via referência
            </span>
          ) : idea.is_manual ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <PenLine className="size-3" />
              Manual
            </span>
          ) : null}
        </div>

        {/* Justification (expandable) */}
        {idea.justification && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? (
                <ChevronUp className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )}
              Justificativa
            </button>
            {expanded ? (
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {idea.justification}
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                {idea.justification}
              </p>
            )}
          </div>
        )}

        {/* Action buttons: pending */}
        {idea.status === "pending" && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="text-primary-foreground shadow-md hover:shadow-lg transition-all"
              style={{ background: "var(--gradient-primary)" }}
              onClick={() => handleStatusChange("approved")}
              disabled={loading !== null}
            >
              {loading === "approved" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCircle className="size-3.5" />
              )}
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
              onClick={() => handleStatusChange("rejected")}
              disabled={loading !== null}
            >
              {loading === "rejected" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <X className="size-3.5" />
              )}
              Rejeitar
            </Button>
          </div>
        )}

        {/* Action button: approved -> generate piece */}
        {idea.status === "approved" && (
          <div className="pt-1">
            <Button
              size="sm"
              onClick={handleGeneratePiece}
              disabled={loading !== null}
            >
              {loading === "generate" ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  Gerar Peça
                </>
              )}
            </Button>
          </div>
        )}

        {/* Inline feedback */}
        {success && (
          <p className="text-xs font-medium text-emerald-500">{success}</p>
        )}
        {error && (
          <p className="text-xs font-medium text-red-500">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
