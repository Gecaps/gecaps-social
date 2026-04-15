"use client";

import { useRouter } from "next/navigation";
import { Calendar, Megaphone, Heart, MessageCircle, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Piece } from "@/modules/pieces/types";
import type { Metrics } from "@/modules/metrics/types";
import { PILAR_LABELS, PILAR_COLORS } from "@/modules/accounts/types";

const FORMAT_LABELS: Record<string, string> = {
  estatico: "Estatico",
  carrossel: "Carrossel",
  reels: "Reels",
  story: "Story",
};

const FORMAT_COLORS: Record<string, string> = {
  estatico: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  carrossel: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  story: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  reels: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

interface PublicadosPageClientProps {
  accountId: string;
  pieces: Piece[];
  metricsMap: Record<string, Metrics>;
}

export function PublicadosPageClient({
  accountId,
  pieces,
  metricsMap,
}: PublicadosPageClientProps) {
  const router = useRouter();

  if (pieces.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-extrabold tracking-tight">
            Publicados
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pecas publicadas nesta conta
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
            <Megaphone className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Nenhuma peca publicada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Quando pecas forem publicadas, elas aparecerao aqui.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold tracking-tight">
          Publicados
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {pieces.length} peca{pieces.length !== 1 ? "s" : ""} publicada
          {pieces.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pieces.map((piece) => {
          const metrics = metricsMap[piece.id];
          const publishedDate = piece.published_date
            ? new Date(piece.published_date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })
            : null;

          return (
            <button
              key={piece.id}
              onClick={() => router.push(`/${accountId}/pecas/${piece.id}`)}
              className="rounded-xl border border-border bg-card p-4 text-left transition-all hover:ring-2 hover:ring-primary/30 space-y-3"
            >
              {/* Title */}
              <h3 className="text-sm font-bold leading-tight line-clamp-2">
                {piece.title}
              </h3>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={`text-[10px] ${PILAR_COLORS[piece.pilar]}`}
                >
                  {PILAR_LABELS[piece.pilar]}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${FORMAT_COLORS[piece.format] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}
                >
                  {FORMAT_LABELS[piece.format] || piece.format}
                </Badge>
              </div>

              {/* Published date */}
              {publishedDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="size-3" />
                  {publishedDate}
                </div>
              )}

              {/* Metrics summary */}
              {metrics && (
                <div className="flex items-center gap-3 pt-1 border-t border-border">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="size-3 text-pink-400" />
                    {metrics.likes}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageCircle className="size-3 text-blue-400" />
                    {metrics.comments}
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-xs font-medium text-emerald-400">
                    <BarChart3 className="size-3" />
                    {metrics.engagement_rate}%
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
