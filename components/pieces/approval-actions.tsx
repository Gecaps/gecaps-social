"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Piece } from "@/modules/pieces/types";
import type { PieceStatus } from "@/modules/accounts/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/modules/accounts/types";
import { getValidNextStatuses } from "@/modules/pieces/status-machine";
import { cn } from "@/lib/utils";
import { Loader2, AlertTriangle, Pause, CheckCircle, ArrowRight } from "lucide-react";

interface ApprovalActionsProps {
  piece: Piece;
  accountId: string;
}

const STATUS_ICONS: Partial<Record<PieceStatus, React.ReactNode>> = {
  rejected: <AlertTriangle className="size-3.5" />,
  paused: <Pause className="size-3.5" />,
  final_approved: <CheckCircle className="size-3.5" />,
  published: <CheckCircle className="size-3.5" />,
};

export function ApprovalActions({ piece, accountId }: ApprovalActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validNext = getValidNextStatuses(piece.status);

  async function handleTransition(newStatus: PieceStatus) {
    if (newStatus === "rejected" && !showRejectReason) {
      setShowRejectReason(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const body: Record<string, string> = { status: newStatus };
      if (newStatus === "rejected" && rejectionReason.trim()) {
        body.rejection_reason = rejectionReason.trim();
      }

      const res = await fetch(`/api/pieces/${piece.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao transicionar status");
      }

      setShowRejectReason(false);
      setRejectionReason("");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (validNext.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Status atual:</span>
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
            STATUS_COLORS[piece.status]
          )}
        >
          {STATUS_LABELS[piece.status]}
        </span>
      </div>

      {showRejectReason && (
        <div className="space-y-2">
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Motivo da rejeição..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleTransition("rejected")}
              disabled={loading || !rejectionReason.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
            >
              {loading && <Loader2 className="size-3 animate-spin" />}
              Confirmar rejeição
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRejectReason(false);
                setRejectionReason("");
              }}
              className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {!showRejectReason && (
        <div className="flex flex-wrap gap-2">
          {validNext.map((status) => {
            const isDestructive =
              status === "rejected" || status === "paused";
            return (
              <button
                key={status}
                type="button"
                onClick={() => handleTransition(status)}
                disabled={loading}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
                  isDestructive
                    ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
                    : "border-primary/20 text-primary hover:bg-primary/10"
                )}
              >
                {loading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  STATUS_ICONS[status] || (
                    <ArrowRight className="size-3.5" />
                  )
                )}
                {STATUS_LABELS[status]}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
