"use client";

import Link from "next/link";
import { Globe, FileText, File } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Reference, ReferenceType } from "@/modules/references/types";

interface ReferenceCardProps {
  reference: Reference;
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

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return "há 1 dia";
  if (diffDays < 30) return `há ${diffDays} dias`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "há 1 mês";
  return `há ${diffMonths} meses`;
}

function getRelevanceColor(score: number | null): string {
  if (score === null) return "bg-gray-500/10 text-gray-400";
  if (score >= 7) return "bg-emerald-500/10 text-emerald-500";
  if (score >= 4) return "bg-amber-500/10 text-amber-500";
  return "bg-red-500/10 text-red-400";
}

function getSourceLabel(ref: Reference): string {
  if (ref.type === "link" && ref.source_url) {
    try {
      return new URL(ref.source_url).hostname;
    } catch {
      return ref.source_url;
    }
  }
  if (ref.type === "text") return "Texto manual";
  if (ref.file_url) {
    const parts = ref.file_url.split("/");
    return parts[parts.length - 1] || "Arquivo";
  }
  return "Referência";
}

export function ReferenceCard({ reference, accountId }: ReferenceCardProps) {
  const Icon = typeIcons[reference.type] || FileText;

  return (
    <Link href={`/${accountId}/referencias/${reference.id}`}>
      <Card className="cursor-pointer transition-all hover:ring-2 hover:ring-primary/30">
        <CardContent className="space-y-3">
          {/* Header: icon + source + date */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <span className="truncate text-sm font-medium">
                {getSourceLabel(reference)}
              </span>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {getRelativeTime(reference.created_at)}
            </span>
          </div>

          {/* Summary */}
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {reference.summary || "Aguardando processamento..."}
          </p>

          {/* Tags */}
          {reference.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {reference.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer: status + relevance */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                statusColors[reference.status] || ""
              }`}
            >
              {statusLabels[reference.status] || reference.status}
            </span>
            {reference.relevance_score !== null && (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getRelevanceColor(
                  reference.relevance_score
                )}`}
              >
                {reference.relevance_score}/10
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
