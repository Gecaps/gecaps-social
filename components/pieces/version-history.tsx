"use client";

import { useState } from "react";
import type { PieceVersion } from "@/modules/pieces/types";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, GitCommit } from "lucide-react";

interface VersionHistoryProps {
  versions: PieceVersion[];
}

const CHANGE_TYPE_COLORS: Record<string, string> = {
  edit: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  revision: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ai: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  initial: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function VersionHistory({ versions }: VersionHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (versions.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-2">
        Nenhuma versão anterior.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {versions.map((v) => {
        const isExpanded = expandedId === v.id;
        return (
          <div key={v.id} className="rounded-lg border border-border bg-card">
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : v.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left"
            >
              {isExpanded ? (
                <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
              )}
              <GitCommit className="size-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs font-medium">v{v.version}</span>
              {v.change_type && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    CHANGE_TYPE_COLORS[v.change_type] ??
                      "bg-gray-500/10 text-gray-400 border-gray-500/20"
                  )}
                >
                  {v.change_type}
                </span>
              )}
              <span className="ml-auto text-[10px] text-muted-foreground">
                {formatDate(v.created_at)}
              </span>
            </button>

            {isExpanded && (
              <div className="border-t border-border px-3 py-2 space-y-2">
                {v.feedback && (
                  <div>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Feedback
                    </span>
                    <p className="text-xs text-foreground mt-0.5">
                      {v.feedback}
                    </p>
                  </div>
                )}
                {v.caption && (
                  <div>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Legenda
                    </span>
                    <p className="text-xs text-foreground mt-0.5 whitespace-pre-wrap line-clamp-6">
                      {v.caption}
                    </p>
                  </div>
                )}
                {v.hashtags && (
                  <div>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Hashtags
                    </span>
                    <p className="text-xs text-foreground mt-0.5">
                      {v.hashtags}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
