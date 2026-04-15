"use client";

import type { Piece } from "@/modules/pieces/types";
import type { PieceStatus } from "@/modules/accounts/types";
import { STATUS_LABELS } from "@/modules/accounts/types";
import { PipelineCard } from "./pipeline-card";

const MAIN_FLOW_COLUMNS: PieceStatus[] = [
  "in_production",
  "final_approved",
  "scheduled",
  "published",
];

const ALL_COLUMNS: PieceStatus[] = [
  "reference",
  "idea",
  "idea_approved",
  "in_production",
  "final_approved",
  "scheduled",
  "published",
  "rejected",
  "in_adjustment",
  "paused",
];

const COLUMN_BORDER_COLORS: Record<PieceStatus, string> = {
  reference: "border-t-gray-500",
  idea: "border-t-purple-500",
  idea_approved: "border-t-violet-500",
  in_production: "border-t-amber-500",
  final_approved: "border-t-emerald-500",
  scheduled: "border-t-blue-500",
  published: "border-t-indigo-500",
  rejected: "border-t-red-500",
  in_adjustment: "border-t-orange-500",
  paused: "border-t-gray-400",
};

const COUNT_BG_COLORS: Record<PieceStatus, string> = {
  reference: "bg-gray-500/20 text-gray-400",
  idea: "bg-purple-500/20 text-purple-400",
  idea_approved: "bg-violet-500/20 text-violet-400",
  in_production: "bg-amber-500/20 text-amber-400",
  final_approved: "bg-emerald-500/20 text-emerald-400",
  scheduled: "bg-blue-500/20 text-blue-400",
  published: "bg-indigo-500/20 text-indigo-400",
  rejected: "bg-red-500/20 text-red-400",
  in_adjustment: "bg-orange-500/20 text-orange-400",
  paused: "bg-gray-500/20 text-gray-400",
};

interface PipelineBoardProps {
  pieces: Piece[];
  accountId: string;
}

export function PipelineBoard({ pieces, accountId }: PipelineBoardProps) {
  // Group pieces by status
  const grouped: Record<PieceStatus, Piece[]> = {} as Record<
    PieceStatus,
    Piece[]
  >;
  for (const status of ALL_COLUMNS) {
    grouped[status] = [];
  }
  for (const piece of pieces) {
    if (grouped[piece.status]) {
      grouped[piece.status].push(piece);
    }
  }

  // Determine visible columns: main flow always visible, others only if they have pieces
  const visibleColumns = ALL_COLUMNS.filter(
    (status) =>
      MAIN_FLOW_COLUMNS.includes(status) || grouped[status].length > 0
  );

  return (
    <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="inline-flex gap-3 min-w-full">
        {visibleColumns.map((status) => {
          const columnPieces = grouped[status];
          return (
            <div
              key={status}
              className={`min-w-[260px] max-w-[300px] flex-shrink-0 rounded-xl border-t-[3px] bg-muted/30 p-3 ${COLUMN_BORDER_COLORS[status]}`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 sticky top-0">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  {STATUS_LABELS[status]}
                </h3>
                <span
                  className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold min-w-[20px] ${COUNT_BG_COLORS[status]}`}
                >
                  {columnPieces.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2">
                {columnPieces.length > 0 ? (
                  columnPieces.map((piece) => (
                    <PipelineCard
                      key={piece.id}
                      piece={piece}
                      accountId={accountId}
                    />
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-border/50 p-4 text-center">
                    <p className="text-[10px] text-muted-foreground">
                      Nenhuma peca
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
