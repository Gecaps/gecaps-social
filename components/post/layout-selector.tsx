"use client";

import type { PostLayout } from "@/lib/types";
import { LAYOUT_LABELS, LAYOUT_DESCRIPTIONS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LayoutSelectorProps {
  selected: PostLayout;
  onSelect: (layout: PostLayout) => void;
}

const LAYOUTS: PostLayout[] = ["branco", "verde", "quote", "foto", "premium"];

const LAYOUT_PREVIEW: Record<PostLayout, { bg: string; text: string; accent: string }> = {
  branco: { bg: "bg-[#f7faf7]", text: "text-[#1B2A1B]", accent: "bg-[#43A047]" },
  verde: { bg: "bg-gradient-to-b from-[#1B5E20] to-[#388E3C]", text: "text-white", accent: "bg-white/30" },
  quote: { bg: "bg-[#0f0f1a]", text: "text-[#f5f5f5]", accent: "bg-[#c9a96e]" },
  foto: { bg: "bg-gradient-to-b from-gray-600 to-gray-800", text: "text-white", accent: "bg-white/40" },
  premium: { bg: "bg-gradient-to-b from-gray-500 to-gray-900", text: "text-white", accent: "bg-[#c9a96e]" },
};

export function LayoutSelector({ selected, onSelect }: LayoutSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {LAYOUTS.map((layout) => {
        const preview = LAYOUT_PREVIEW[layout];
        const isActive = selected === layout;
        const isDisabled = layout === "premium";

        return (
          <button
            key={layout}
            onClick={() => !isDisabled && onSelect(layout)}
            disabled={isDisabled}
            title={LAYOUT_DESCRIPTIONS[layout]}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all shrink-0",
              isActive
                ? "ring-2 ring-primary bg-primary/10"
                : "hover:bg-muted/50",
              isDisabled && "opacity-40 cursor-not-allowed"
            )}
          >
            {/* Mini preview */}
            <div className={`w-14 h-[70px] rounded-md ${preview.bg} flex flex-col items-center justify-center gap-1 p-1.5 border border-border/30`}>
              <div className={`w-6 h-0.5 rounded ${preview.accent}`} />
              <div className={`w-8 h-1 rounded ${preview.text} opacity-80`} />
              <div className={`w-7 h-1 rounded ${preview.text} opacity-50`} />
            </div>
            <span className={cn(
              "text-[10px] font-medium",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              {LAYOUT_LABELS[layout]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
