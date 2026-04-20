"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Piece, PieceVersion } from "@/modules/pieces/types";
import type { PieceLayout } from "@/modules/accounts/types";
import { PILAR_LABELS, LAYOUT_LABELS, LAYOUT_DESCRIPTIONS } from "@/modules/accounts/types";
import { ApprovalActions } from "./approval-actions";
import { VersionHistory } from "./version-history";
import { PhotoSearch } from "./photo-search";
import { GeminiImage } from "./gemini-image";
import { CarouselBuilder, type CarouselSlide } from "./carousel-builder";
import {
  ArrowLeft,
  Download,
  Sparkles,
  Loader2,
  Save,
  Palette,
  Type,
  Image as ImageIcon,
  Wand2,
  MessageSquare,
  Layers,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface PieceEditorProps {
  piece: Piece;
  versions: PieceVersion[];
  accountId: string;
}

const RENDER_TEMPLATE: Record<PieceLayout, string> = {
  branco: "branco",
  verde: "verde",
  quote: "quote",
  foto: "foto-premium",
  magazine: "magazine",
  editorial: "editorial",
};

const LAYOUTS: PieceLayout[] = ["branco", "verde", "quote", "foto", "magazine", "editorial"];

/* ---- Collapsible section card ---- */
function Section({
  icon,
  title,
  color,
  defaultOpen = false,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl border transition-all duration-200 ${
      open ? "border-primary/20 bg-card shadow-md" : "border-border bg-card/60 hover:bg-card hover:border-border"
    }`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className={`flex items-center justify-center size-9 rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}>
          {icon}
        </div>
        <span className="text-sm font-semibold flex-1">{title}</span>
        <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

export function PieceEditor({ piece, versions, accountId }: PieceEditorProps) {
  const router = useRouter();

  // --- Persisted fields ---
  const [title, setTitle] = useState(piece.title);
  const [caption, setCaption] = useState(piece.caption ?? "");
  const [hashtags, setHashtags] = useState(piece.hashtags ?? "");
  const [cta, setCta] = useState(piece.cta ?? "");
  const [imageUrl, setImageUrl] = useState(piece.image_url ?? "");
  const [layout, setLayout] = useState<PieceLayout>(piece.layout);
  const [creativeBrief, setCreativeBrief] = useState(piece.creative_brief ?? "");
  const [visualDirection, setVisualDirection] = useState(piece.visual_direction ?? "");

  // --- Visual-only fields ---
  const [subtitle, setSubtitle] = useState("");
  const [tags, setTags] = useState("");
  const [highlight, setHighlight] = useState("");
  const [bigNum, setBigNum] = useState("");

  // --- Carousel ---
  const isCarousel = piece.format === "carrossel";
  const [slides, setSlides] = useState<CarouselSlide[]>(() => {
    if (piece.slide_structure && Array.isArray(piece.slide_structure) && piece.slide_structure.length > 0) {
      return piece.slide_structure.map((s) => ({
        id: (s.id as string) || crypto.randomUUID(),
        title: (s.title as string) || "",
        subtitle: (s.subtitle as string) || "",
        tags: (s.tags as string) || "",
        cta: (s.cta as string) || "",
        highlight: (s.highlight as string) || "",
        bigNum: (s.bigNum as string) || "",
        imageUrl: (s.imageUrl as string) || "",
        layout: (s.layout as PieceLayout) || layout,
      }));
    }
    return isCarousel
      ? [{
          id: crypto.randomUUID(), title: piece.title, subtitle: "", tags: "",
          cta: piece.cta ?? "", highlight: "", bigNum: "",
          imageUrl: piece.image_url ?? "", layout,
        }]
      : [];
  });
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);

  // --- UI ---
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handle = piece.hook ?? "@gecapsbrasil";
  const badge = PILAR_LABELS[piece.pilar] ?? piece.pilar;
  const hasImage = layout === "foto" || layout === "magazine" || layout === "editorial";

  // --- Active slide ---
  const activeSlideData = isCarousel && slides.length > 0
    ? slides[Math.min(previewSlideIndex, slides.length - 1)]
    : null;

  // --- Preview URL ---
  const previewUrl = useMemo(() => {
    const s = activeSlideData;
    const p = new URLSearchParams();
    p.set("title", s?.title || title);
    p.set("pilar", piece.pilar);
    p.set("layout", s?.layout || layout);
    p.set("handle", handle);
    p.set("w", "540");
    const v = {
      subtitle: s?.subtitle || subtitle,
      tags: s?.tags || tags,
      cta: s?.cta || cta,
      highlight: s?.highlight || highlight,
      bigNum: s?.bigNum || bigNum,
      image: s?.imageUrl || imageUrl,
    };
    Object.entries(v).forEach(([k, val]) => { if (val) p.set(k, val); });
    return `/api/preview?${p.toString()}`;
  }, [activeSlideData, title, piece.pilar, layout, handle, subtitle, tags, cta, highlight, bigNum, imageUrl]);

  // --- Render URL ---
  const renderUrl = useMemo(() => {
    const s = activeSlideData;
    const p = new URLSearchParams();
    p.set("template", RENDER_TEMPLATE[s?.layout || layout]);
    p.set("title", s?.title || title);
    p.set("badge", badge);
    p.set("handle", handle);
    const v = {
      subtitle: s?.subtitle || subtitle,
      tags: s?.tags || tags,
      cta: s?.cta || cta,
      highlight: s?.highlight || highlight,
      bigNum: s?.bigNum || bigNum,
      image: s?.imageUrl || imageUrl,
    };
    Object.entries(v).forEach(([k, val]) => { if (val) p.set(k, val); });
    return `/api/render?${p.toString()}`;
  }, [activeSlideData, title, layout, badge, handle, subtitle, tags, cta, highlight, bigNum, imageUrl]);

  const showFeedback = useCallback((type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title, caption: caption || null, hashtags: hashtags || null,
        cta: cta || null, image_url: imageUrl || null, layout,
        creative_brief: creativeBrief || null, visual_direction: visualDirection || null,
        slide_structure: isCarousel && slides.length > 0 ? slides : null,
      };
      const res = await fetch(`/api/pieces/${piece.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erro ao salvar"); }
      showFeedback("success", "Salvo!");
      router.refresh();
    } catch (err) { showFeedback("error", (err as Error).message); }
    finally { setSaving(false); }
  }

  async function handleDownloadHD() {
    setDownloading(true);
    try {
      const slug = title.slice(0, 40).replace(/\s+/g, "-").toLowerCase();

      if (isCarousel && slides.length > 1) {
        const res = await fetch("/api/render/carousel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slides,
            badge,
            handle,
            fileName: slug,
          }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || "Erro ao renderizar carrossel");
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${slug}-hd.zip`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showFeedback("success", `${slides.length} slides baixados!`);
        return;
      }

      const res = await fetch(renderUrl);
      if (!res.ok) throw new Error("Erro ao renderizar");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}-hd.png`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showFeedback("success", "Download HD iniciado!");
    } catch (err) { showFeedback("error", (err as Error).message); }
    finally { setDownloading(false); }
  }

  async function handleGenerateCaption() {
    setGeneratingCaption(true);
    try {
      const res = await fetch("/api/ai/generate-caption", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, hook: piece.hook, pilar: piece.pilar,
          cta: cta || undefined, account_id: piece.account_id,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erro"); }
      const data = await res.json();
      const full = data.caption as string;
      const hm = full.match(/(#\w[\w\d]*(?:\s+#\w[\w\d]*)+)\s*$/);
      if (hm) {
        setCaption(full.slice(0, full.lastIndexOf(hm[1])).trim());
        setHashtags(hm[1]);
      } else { setCaption(full); }
      showFeedback("success", "Legenda gerada!");
    } catch (err) { showFeedback("error", (err as Error).message); }
    finally { setGeneratingCaption(false); }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
      {/* ===== TOP BAR ===== */}
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(`/${accountId}/pipeline`)}
          className="rounded-xl p-2.5 text-muted-foreground hover:bg-card hover:text-foreground transition-all"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div className="flex-1 min-w-0">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            rows={1}
            className="w-full bg-transparent text-lg font-bold placeholder:text-muted-foreground focus:outline-none resize-none leading-tight"
            placeholder="Titulo..."
          />
        </div>

        {feedback && (
          <div className={`rounded-full px-3 py-1.5 text-xs font-medium animate-in fade-in ${
            feedback.type === "success" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
          }`}>
            {feedback.message}
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-card transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Salvar
        </button>
        <button
          type="button"
          onClick={handleDownloadHD}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[var(--accent-violet,oklch(0.65_0.2_300))] px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          Baixar HD
        </button>
      </div>

      {/* ===== MAIN: Editor | Preview ===== */}
      <div className="grid gap-5 lg:grid-cols-[1fr_400px]">

        {/* ===== LEFT: Stacked section cards ===== */}
        <div className="space-y-3">

          {/* 1. CARROSSEL (if applicable) */}
          {isCarousel && (
            <Section
              icon={<Layers className="size-5" />}
              title={`Montador de Carrossel — ${slides.length} slide${slides.length !== 1 ? "s" : ""}`}
              color="from-violet-500 to-purple-600"
              defaultOpen
            >
              <CarouselBuilder
                slides={slides}
                onChange={setSlides}
                onPreviewSlide={(_slide, index) => setPreviewSlideIndex(index)}
                defaultLayout={layout}
              />
            </Section>
          )}

          {/* 2. ESTILO (layout) */}
          {!isCarousel && (
            <Section
              icon={<Palette className="size-5" />}
              title={`Estilo — ${LAYOUT_LABELS[layout]}`}
              color="from-amber-500 to-orange-500"
              defaultOpen
            >
              <div className="grid grid-cols-3 gap-2">
                {LAYOUTS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLayout(l)}
                    className={`relative rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                      layout === l
                        ? "border-primary bg-primary/8 shadow-[0_0_15px_var(--glow-primary)] scale-[1.02]"
                        : "border-border bg-background hover:border-primary/30 hover:scale-[1.01]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center justify-center size-8 rounded-lg text-xs font-bold ${
                        layout === l
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {l[0].toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{LAYOUT_LABELS[l]}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{LAYOUT_DESCRIPTIONS[l]}</p>
                      </div>
                    </div>
                    {layout === l && (
                      <CheckCircle2 className="absolute top-2 right-2 size-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* 3. TEXTO (single post only) */}
          {!isCarousel && (
            <Section
              icon={<Type className="size-5" />}
              title="Texto do Criativo"
              color="from-blue-500 to-cyan-500"
              defaultOpen={false}
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Subtitulo</label>
                    <input
                      type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="Subtitulo opcional..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">CTA</label>
                    <input
                      type="text" value={cta} onChange={(e) => setCta(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="Saiba mais"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Tags</label>
                    <input
                      type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="SAUDE · BEM-ESTAR"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Destaque</label>
                    <input
                      type="text" value={highlight} onChange={(e) => setHighlight(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="palavras em destaque"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Big Number</label>
                    <input
                      type="text" value={bigNum} onChange={(e) => setBigNum(e.target.value.slice(0, 2))} maxLength={2}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-lg font-black text-center placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="5x"
                    />
                  </div>
                  <div />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Briefing criativo</label>
                    <textarea
                      value={creativeBrief} onChange={(e) => setCreativeBrief(e.target.value)} rows={2}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      placeholder="Contexto para IA..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Direção visual</label>
                    <textarea
                      value={visualDirection} onChange={(e) => setVisualDirection(e.target.value)} rows={2}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      placeholder="Cores, mood, estilo..."
                    />
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* 4. FOTO (Pexels) — only for image layouts, single post */}
          {!isCarousel && hasImage && (
            <Section
              icon={<ImageIcon className="size-5" />}
              title="Buscar Foto"
              color="from-emerald-500 to-green-500"
              defaultOpen={false}
            >
              <PhotoSearch
                onSelect={setImageUrl}
                currentUrl={imageUrl || undefined}
              />
            </Section>
          )}

          {/* 5. IA (Nano Banana) — only for image layouts, single post */}
          {!isCarousel && hasImage && (
            <Section
              icon={<Wand2 className="size-5" />}
              title="Nano Banana IA"
              color="from-primary to-[var(--accent-violet,oklch(0.65_0.2_300))]"
              defaultOpen={false}
            >
              <GeminiImage
                onImageGenerated={setImageUrl}
                currentImageUrl={imageUrl || undefined}
                creativeBrief={creativeBrief}
                accountId={accountId}
              />
            </Section>
          )}

          {/* 6. LEGENDA */}
          <Section
            icon={<MessageSquare className="size-5" />}
            title="Legenda & Hashtags"
            color="from-pink-500 to-rose-500"
            defaultOpen={false}
          >
            <div className="space-y-3">
              {/* Generate button */}
              <button
                type="button"
                onClick={handleGenerateCaption}
                disabled={generatingCaption || !title}
                className="w-full rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center hover:border-primary/50 hover:bg-primary/8 transition-all disabled:opacity-50 group"
              >
                <div className="inline-flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-primary to-[var(--accent-violet,oklch(0.65_0.2_300))] text-white mb-2 group-hover:scale-110 transition-transform">
                  {generatingCaption ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
                </div>
                <p className="text-sm font-semibold">
                  {generatingCaption ? "Gerando..." : "Gerar legenda com IA"}
                </p>
              </button>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Legenda</label>
                <textarea
                  value={caption} onChange={(e) => setCaption(e.target.value)} rows={5}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  placeholder="Legenda do post..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Hashtags</label>
                <input
                  type="text" value={hashtags} onChange={(e) => setHashtags(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="#gecaps #saude #suplementos"
                />
              </div>
            </div>
          </Section>
        </div>

        {/* ===== RIGHT: Preview + Status ===== */}
        <div className="space-y-4">
          {/* Preview */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg sticky top-4">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-muted-foreground">Preview ao vivo</span>
              {isCarousel && slides.length > 1 && (
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewSlideIndex(Math.max(0, previewSlideIndex - 1))}
                    disabled={previewSlideIndex === 0}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="text-xs font-bold tabular-nums">
                    {previewSlideIndex + 1} / {slides.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewSlideIndex(Math.min(slides.length - 1, previewSlideIndex + 1))}
                    disabled={previewSlideIndex >= slides.length - 1}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={previewUrl}
              src={previewUrl}
              alt="Preview"
              className="w-full"
            />
          </div>

          {/* Approval */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="size-4 text-muted-foreground" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Aprovação</h3>
            </div>
            <ApprovalActions piece={piece} accountId={accountId} />
          </div>

          {/* Version history */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="size-4 text-muted-foreground" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Versões</h3>
            </div>
            <VersionHistory versions={versions} />
          </div>
        </div>
      </div>
    </div>
  );
}
