"use client";

import { useState, useCallback } from "react";
import type { PieceLayout } from "@/modules/accounts/types";
import { LAYOUT_LABELS } from "@/modules/accounts/types";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Copy,
  Eye,
} from "lucide-react";

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  tags: string;
  cta: string;
  highlight: string;
  bigNum: string;
  imageUrl: string;
  layout: PieceLayout;
}

function createSlide(defaults?: Partial<CarouselSlide>): CarouselSlide {
  return {
    id: crypto.randomUUID(),
    title: "",
    subtitle: "",
    tags: "",
    cta: "",
    highlight: "",
    bigNum: "",
    imageUrl: "",
    layout: "branco",
    ...defaults,
  };
}

interface CarouselBuilderProps {
  slides: CarouselSlide[];
  onChange: (slides: CarouselSlide[]) => void;
  onPreviewSlide: (slide: CarouselSlide, index: number) => void;
  defaultLayout: PieceLayout;
}

const LAYOUT_OPTIONS: PieceLayout[] = [
  "branco",
  "verde",
  "quote",
  "foto",
  "magazine",
  "editorial",
];

export function CarouselBuilder({
  slides,
  onChange,
  onPreviewSlide,
  defaultLayout,
}: CarouselBuilderProps) {
  const [activeSlideId, setActiveSlideId] = useState<string | null>(
    slides[0]?.id ?? null
  );

  const addSlide = useCallback(() => {
    const newSlide = createSlide({ layout: defaultLayout });
    const updated = [...slides, newSlide];
    onChange(updated);
    setActiveSlideId(newSlide.id);
  }, [slides, onChange, defaultLayout]);

  const duplicateSlide = useCallback(
    (index: number) => {
      const source = slides[index];
      const copy = createSlide({ ...source, id: crypto.randomUUID(), title: source.title + " (cópia)" });
      const updated = [...slides];
      updated.splice(index + 1, 0, copy);
      onChange(updated);
      setActiveSlideId(copy.id);
    },
    [slides, onChange]
  );

  const removeSlide = useCallback(
    (index: number) => {
      if (slides.length <= 1) return;
      const updated = slides.filter((_, i) => i !== index);
      onChange(updated);
      if (slides[index].id === activeSlideId) {
        setActiveSlideId(updated[Math.min(index, updated.length - 1)]?.id ?? null);
      }
    },
    [slides, onChange, activeSlideId]
  );

  const moveSlide = useCallback(
    (index: number, direction: -1 | 1) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= slides.length) return;
      const updated = [...slides];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      onChange(updated);
    },
    [slides, onChange]
  );

  const updateSlide = useCallback(
    (id: string, field: keyof CarouselSlide, value: string) => {
      onChange(
        slides.map((s) => (s.id === id ? { ...s, [field]: value } : s))
      );
    },
    [slides, onChange]
  );

  const activeSlide = slides.find((s) => s.id === activeSlideId);

  return (
    <div className="space-y-4">
      {/* Slide strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setActiveSlideId(slide.id)}
            className={`relative flex-shrink-0 rounded-lg border-2 p-2 w-20 h-20 flex flex-col items-center justify-center gap-1 transition-all ${
              slide.id === activeSlideId
                ? "border-primary bg-primary/8 shadow-[0_0_10px_var(--glow-primary)]"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <span className="text-[10px] font-bold text-primary">
              {i + 1}
            </span>
            <span className="text-[9px] text-muted-foreground truncate w-full text-center">
              {slide.title || LAYOUT_LABELS[slide.layout]}
            </span>
          </button>
        ))}

        {/* Add slide button */}
        <button
          type="button"
          onClick={addSlide}
          className="flex-shrink-0 rounded-lg border-2 border-dashed border-border p-2 w-20 h-20 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all"
        >
          <Plus className="size-5" />
          <span className="text-[9px]">Slide</span>
        </button>
      </div>

      {/* Active slide editor */}
      {activeSlide && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          {/* Slide header with actions */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">
              Slide {slides.findIndex((s) => s.id === activeSlide.id) + 1} de{" "}
              {slides.length}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  onPreviewSlide(
                    activeSlide,
                    slides.findIndex((s) => s.id === activeSlide.id)
                  )
                }
                className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                title="Preview deste slide"
              >
                <Eye className="size-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  moveSlide(
                    slides.findIndex((s) => s.id === activeSlide.id),
                    -1
                  )
                }
                disabled={slides.findIndex((s) => s.id === activeSlide.id) === 0}
                className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-30"
                title="Mover para esquerda"
              >
                <ChevronUp className="size-4 -rotate-90" />
              </button>
              <button
                type="button"
                onClick={() =>
                  moveSlide(
                    slides.findIndex((s) => s.id === activeSlide.id),
                    1
                  )
                }
                disabled={
                  slides.findIndex((s) => s.id === activeSlide.id) ===
                  slides.length - 1
                }
                className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-30"
                title="Mover para direita"
              >
                <ChevronDown className="size-4 -rotate-90" />
              </button>
              <button
                type="button"
                onClick={() =>
                  duplicateSlide(
                    slides.findIndex((s) => s.id === activeSlide.id)
                  )
                }
                className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                title="Duplicar slide"
              >
                <Copy className="size-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  removeSlide(
                    slides.findIndex((s) => s.id === activeSlide.id)
                  )
                }
                disabled={slides.length <= 1}
                className="rounded p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30"
                title="Remover slide"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>

          {/* Layout selector inline */}
          <div>
            <label className="mb-1 block text-[11px] text-muted-foreground">
              Layout
            </label>
            <div className="flex flex-wrap gap-1.5">
              {LAYOUT_OPTIONS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => updateSlide(activeSlide.id, "layout", l)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                    activeSlide.layout === l
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {LAYOUT_LABELS[l]}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1 block text-[11px] text-muted-foreground">
              Título
            </label>
            <textarea
              value={activeSlide.title}
              onChange={(e) =>
                updateSlide(activeSlide.id, "title", e.target.value)
              }
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Título do slide..."
            />
          </div>

          {/* Subtitle + CTA */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">
                Subtítulo
              </label>
              <input
                type="text"
                value={activeSlide.subtitle}
                onChange={(e) =>
                  updateSlide(activeSlide.id, "subtitle", e.target.value)
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Subtítulo..."
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">
                CTA
              </label>
              <input
                type="text"
                value={activeSlide.cta}
                onChange={(e) =>
                  updateSlide(activeSlide.id, "cta", e.target.value)
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Saiba mais"
              />
            </div>
          </div>

          {/* Tags + Highlight */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">
                Tags
              </label>
              <input
                type="text"
                value={activeSlide.tags}
                onChange={(e) =>
                  updateSlide(activeSlide.id, "tags", e.target.value)
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="SAUDE · BEM-ESTAR"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">
                Highlight
              </label>
              <input
                type="text"
                value={activeSlide.highlight}
                onChange={(e) =>
                  updateSlide(activeSlide.id, "highlight", e.target.value)
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="palavras destacadas"
              />
            </div>
          </div>

          {/* Image URL */}
          {(activeSlide.layout === "foto" ||
            activeSlide.layout === "magazine" ||
            activeSlide.layout === "editorial") && (
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">
                Imagem URL
              </label>
              <input
                type="url"
                value={activeSlide.imageUrl}
                onChange={(e) =>
                  updateSlide(activeSlide.id, "imageUrl", e.target.value)
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="https://..."
              />
            </div>
          )}
        </div>
      )}

      {slides.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-3">
            Nenhum slide ainda. Adicione o primeiro!
          </p>
          <button
            type="button"
            onClick={addSlide}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" />
            Adicionar primeiro slide
          </button>
        </div>
      )}
    </div>
  );
}
