"use client";

import type { PieceLayout } from "@/modules/accounts/types";
import { LAYOUT_LABELS, LAYOUT_DESCRIPTIONS } from "@/modules/accounts/types";
import { cn } from "@/lib/utils";

const LAYOUTS: PieceLayout[] = ["branco", "verde", "quote", "foto"];

interface LayoutSelectorProps {
  selected: PieceLayout;
  onSelect: (layout: PieceLayout) => void;
}

export function LayoutSelector({ selected, onSelect }: LayoutSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {LAYOUTS.map((layout) => (
        <button
          key={layout}
          type="button"
          onClick={() => onSelect(layout)}
          className={cn(
            "rounded-xl border p-3 text-left transition-all duration-200",
            selected === layout
              ? "border-primary/50 bg-primary/8 shadow-[0_0_10px_var(--glow-primary)] ring-1 ring-primary/20"
              : "border-border bg-card hover:border-primary/30 hover:shadow-[0_0_6px_var(--glow-primary)]"
          )}
        >
          <span className="text-sm font-semibold">{LAYOUT_LABELS[layout]}</span>
          <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
            {LAYOUT_DESCRIPTIONS[layout]}
          </p>
        </button>
      ))}
    </div>
  );
}
