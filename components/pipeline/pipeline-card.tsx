"use client";

import { useRouter } from "next/navigation";
import { Calendar, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Piece } from "@/modules/pieces/types";
import {
  PILAR_LABELS,
  PILAR_COLORS,
  STATUS_LABELS,
} from "@/modules/accounts/types";
import type { PieceStatus } from "@/modules/accounts/types";
import { getValidNextStatuses } from "@/modules/pieces/status-machine";
import { useState } from "react";

const FORMAT_LABELS: Record<string, string> = {
  estatico: "Estatico",
  carrossel: "Carrossel",
  reels: "Reels",
  story: "Story",
};

const TRANSITION_ICONS: Partial<Record<PieceStatus, string>> = {
  idea: "💡",
  idea_approved: "✅",
  in_production: "🎨",
  final_approved: "✔️",
  scheduled: "📅",
  published: "🚀",
  rejected: "❌",
  in_adjustment: "🔧",
  paused: "⏸",
};

interface PipelineCardProps {
  piece: Piece;
  accountId: string;
}

export function PipelineCard({ piece, accountId }: PipelineCardProps) {
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const validNext = getValidNextStatuses(piece.status);

  async function handleTransition(newStatus: PieceStatus) {
    setTransitioning(true);
    try {
      const res = await fetch(`/api/pieces/${piece.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error("Transition failed:", err.error);
        return;
      }
      router.refresh();
    } catch (e) {
      console.error("Transition error:", e);
    } finally {
      setTransitioning(false);
      setShowActions(false);
    }
  }

  const scheduledDate = piece.scheduled_date
    ? new Date(piece.scheduled_date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      })
    : null;

  return (
    <div className="group relative rounded-lg border border-border bg-card p-3 hover:border-primary/50 transition-colors">
      {/* Clickable area */}
      <button
        type="button"
        onClick={() => router.push(`/${accountId}/pecas/${piece.id}`)}
        className="w-full text-left"
      >
        <p className="font-semibold text-sm leading-tight truncate">
          {piece.title}
        </p>

        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span
            className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${PILAR_COLORS[piece.pilar]}`}
          >
            {PILAR_LABELS[piece.pilar]}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {FORMAT_LABELS[piece.format] ?? piece.format}
          </span>
        </div>

        {scheduledDate && (
          <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
            <Calendar className="size-3" />
            <span className="text-[10px]">{scheduledDate}</span>
          </div>
        )}
      </button>

      {/* Transition actions */}
      {validNext.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border/50">
          {!showActions ? (
            <button
              type="button"
              onClick={() => setShowActions(true)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="size-3" />
              Mover para...
            </button>
          ) : (
            <div className="flex flex-wrap gap-1">
              {validNext.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={transitioning}
                  onClick={() => handleTransition(status)}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <span>{TRANSITION_ICONS[status] ?? "→"}</span>
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
