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
  Type,
  Image as ImageIcon,
  Wand2,
  Palette,
  MessageSquare,
  Layers,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
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

type EditorTab = "estilo" | "texto" | "imagem" | "ia" | "legenda" | "carrossel";

const LAYOUTS: PieceLayout[] = ["branco", "verde", "quote", "foto", "magazine", "editorial"];

const LAYOUT_EMOJIS: Record<PieceLayout, string> = {
  branco: "B",
  verde: "V",
  quote: "Q",
  foto: "F",
  magazine: "M",
  editorial: "E",
};

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

  // --- UI state ---
  const [activeTab, setActiveTab] = useState<EditorTab>(isCarousel ? "carrossel" : "estilo");
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handle = piece.hook ?? "@gecapsbrasil";
  const badge = PILAR_LABELS[piece.pilar] ?? piece.pilar;
  const hasImage = layout === "foto" || layout === "magazine" || layout === "editorial";

  // --- Active slide for carousel ---
  const activeSlideData = isCarousel && slides.length > 0
    ? slides[Math.min(previewSlideIndex, slides.length - 1)]
    : null;

  // --- Preview URL ---
  const previewUrl = useMemo(() => {
    const s = activeSlideData;
    const params = new URLSearchParams();
    params.set("title", s?.title || title);
    params.set("pilar", piece.pilar);
    params.set("layout", s?.layout || layout);
    params.set("handle", handle);
    params.set("w", "540");
    const _sub = s?.subtitle || subtitle;
    const _tags = s?.tags || tags;
    const _cta = s?.cta || cta;
    const _hl = s?.highlight || highlight;
    const _bn = s?.bigNum || bigNum;
    const _img = s?.imageUrl || imageUrl;
    if (_sub) params.set("subtitle", _sub);
    if (_tags) params.set("tags", _tags);
    if (_cta) params.set("cta", _cta);
    if (_hl) params.set("highlight", _hl);
    if (_bn) params.set("bigNum", _bn);
    if (_img) params.set("image", _img);
    return `/api/preview?${params.toString()}`;
  }, [activeSlideData, title, piece.pilar, layout, handle, subtitle, tags, cta, highlight, bigNum, imageUrl]);

  // --- Render URL ---
  const renderUrl = useMemo(() => {
    const s = activeSlideData;
    const params = new URLSearchParams();
    params.set("template", RENDER_TEMPLATE[s?.layout || layout]);
    params.set("title", s?.title || title);
    params.set("badge", badge);
    params.set("handle", handle);
    const _sub = s?.subtitle || subtitle;
    const _tags = s?.tags || tags;
    const _cta = s?.cta || cta;
    const _hl = s?.highlight || highlight;
    const _bn = s?.bigNum || bigNum;
    const _img = s?.imageUrl || imageUrl;
    if (_sub) params.set("subtitle", _sub);
    if (_tags) params.set("tags", _tags);
    if (_cta) params.set("cta", _cta);
    if (_hl) params.set("highlight", _hl);
    if (_bn) params.set("bigNum", _bn);
    if (_img) params.set("image", _img);
    return `/api/render?${params.toString()}`;
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
      const res = await fetch(renderUrl);
      if (!res.ok) throw new Error("Erro ao renderizar");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.slice(0, 40).replace(/\s+/g, "-").toLowerCase()}-hd.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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

  // --- Tool cards for the toolbar ---
  const toolCards: { id: EditorTab; icon: React.ReactNode; label: string; color: string; show: boolean }[] = [
    ...(isCarousel ? [{ id: "carrossel" as EditorTab, icon: <Layers className="size-5" />, label: "Slides", color: "from-violet-500 to-purple-600", show: true }] : []),
    { id: "estilo", icon: <Palette className="size-5" />, label: "Estilo", color: "from-amber-500 to-orange-500", show: true },
    { id: "texto", icon: <Type className="size-5" />, label: "Texto", color: "from-blue-500 to-cyan-500", show: !isCarousel },
    { id: "imagem", icon: <ImageIcon className="size-5" />, label: "Foto", color: "from-emerald-500 to-green-500", show: hasImage && !isCarousel },
    { id: "ia", icon: <Wand2 className="size-5" />, label: "IA", color: "from-primary to-[var(--accent-violet,oklch(0.65_0.2_300))]", show: hasImage && !isCarousel },
    { id: "legenda", icon: <MessageSquare className="size-5" />, label: "Legenda", color: "from-pink-500 to-rose-500", show: true },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
      {/* ===== TOP BAR ===== */}
      <div className="mb-4 flex items-center gap-3">
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

        {/* Action buttons */}
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

      {/* ===== MAIN LAYOUT: Toolbar | Content | Preview ===== */}
      <div className="grid gap-4 lg:grid-cols-[72px_1fr_400px]">

        {/* ===== LEFT: Tool cards (vertical) ===== */}
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {toolCards.filter(t => t.show).map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => setActiveTab(tool.id)}
              className={`group relative flex-shrink-0 flex flex-col items-center gap-1 rounded-2xl p-3 transition-all ${
                activeTab === tool.id
                  ? "bg-card shadow-lg ring-2 ring-primary/30"
                  : "hover:bg-card/60"
              }`}
            >
              <div className={`rounded-xl p-2 transition-all ${
                activeTab === tool.id
                  ? `bg-gradient-to-br ${tool.color} text-white shadow-md`
                  : "bg-muted/50 text-muted-foreground group-hover:text-foreground"
              }`}>
                {tool.icon}
              </div>
              <span className={`text-[10px] font-semibold ${
                activeTab === tool.id ? "text-foreground" : "text-muted-foreground"
              }`}>
                {tool.label}
              </span>
            </button>
          ))}
        </div>

        {/* ===== CENTER: Active panel ===== */}
        <div className="min-h-[500px]">

          {/* TAB: Estilo */}
          {activeTab === "estilo" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Escolha o estilo
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {LAYOUTS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLayout(l)}
                    className={`group relative rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                      layout === l
                        ? "border-primary bg-primary/8 shadow-[0_0_20px_var(--glow-primary)] scale-[1.02]"
                        : "border-border bg-card hover:border-primary/30 hover:shadow-[0_0_10px_var(--glow-primary)] hover:scale-[1.01]"
                    }`}
                  >
                    {/* Mini preview thumbnail */}
                    <div className={`mb-3 aspect-[3/4] rounded-xl overflow-hidden border border-border/50 ${
                      layout === l ? "ring-2 ring-primary/20" : ""
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/preview?title=${encodeURIComponent(title || "Exemplo")}&pilar=${piece.pilar}&layout=${l}&handle=${handle}&w=280`}
                        alt={LAYOUT_LABELS[l]}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center justify-center size-7 rounded-lg text-xs font-bold ${
                        layout === l
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {LAYOUT_EMOJIS[l]}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{LAYOUT_LABELS[l]}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">{LAYOUT_DESCRIPTIONS[l]}</p>
                      </div>
                    </div>
                    {layout === l && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="size-5 text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Texto */}
          {activeTab === "texto" && !isCarousel && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Texto do criativo
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Card: Subtitulo */}
                <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Subtitulo</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Subtitulo opcional..."
                  />
                </div>

                {/* Card: CTA */}
                <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">CTA (chamada)</label>
                  <input
                    type="text"
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Saiba mais"
                  />
                </div>

                {/* Card: Tags */}
                <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Tags</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="SAUDE · BEM-ESTAR"
                  />
                </div>

                {/* Card: Highlight */}
                <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Destaque</label>
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => setHighlight(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="palavras em destaque"
                  />
                </div>
              </div>

              {/* Card: Big Number */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-2 max-w-xs">
                <label className="text-xs font-semibold text-muted-foreground">Big Number</label>
                <input
                  type="text"
                  value={bigNum}
                  onChange={(e) => setBigNum(e.target.value.slice(0, 2))}
                  maxLength={2}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-2xl font-black text-center placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="5x"
                />
              </div>

              {/* Briefing cards */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Briefing criativo</label>
                  <textarea
                    value={creativeBrief}
                    onChange={(e) => setCreativeBrief(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    placeholder="Contexto para o designer ou IA..."
                  />
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Direção visual</label>
                  <textarea
                    value={visualDirection}
                    onChange={(e) => setVisualDirection(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    placeholder="Cores, mood, estilo..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Imagem (Pexels) */}
          {activeTab === "imagem" && hasImage && !isCarousel && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Buscar foto
              </h2>
              <div className="rounded-2xl border border-border bg-card p-5">
                <PhotoSearch
                  onSelect={setImageUrl}
                  currentUrl={imageUrl || undefined}
                />
              </div>
            </div>
          )}

          {/* TAB: IA (Gemini / Nano Banana) */}
          {activeTab === "ia" && hasImage && !isCarousel && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Nano Banana IA
              </h2>
              <div className="rounded-2xl border border-border bg-card p-5">
                <GeminiImage
                  onImageGenerated={setImageUrl}
                  currentImageUrl={imageUrl || undefined}
                  creativeBrief={creativeBrief}
                  accountId={accountId}
                />
              </div>
            </div>
          )}

          {/* TAB: Legenda */}
          {activeTab === "legenda" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Legenda & Hashtags
              </h2>

              {/* Generate caption card */}
              <button
                type="button"
                onClick={handleGenerateCaption}
                disabled={generatingCaption || !title}
                className="w-full rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-5 text-center hover:border-primary/50 hover:bg-primary/8 transition-all disabled:opacity-50 group"
              >
                <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-gradient-to-br from-primary to-[var(--accent-violet,oklch(0.65_0.2_300))] text-white mb-3 group-hover:scale-110 transition-transform">
                  {generatingCaption ? <Loader2 className="size-6 animate-spin" /> : <Sparkles className="size-6" />}
                </div>
                <p className="text-sm font-semibold">
                  {generatingCaption ? "Gerando legenda..." : "Gerar legenda com IA"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Cria legenda + hashtags com base no titulo e pilar
                </p>
              </button>

              {/* Caption card */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <label className="text-xs font-semibold text-muted-foreground">Legenda</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  placeholder="Legenda do post..."
                />
              </div>

              {/* Hashtags card */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <label className="text-xs font-semibold text-muted-foreground">Hashtags</label>
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="#gecaps #saude #suplementos"
                />
              </div>
            </div>
          )}

          {/* TAB: Carrossel */}
          {activeTab === "carrossel" && isCarousel && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Montador de Carrossel
              </h2>
              <CarouselBuilder
                slides={slides}
                onChange={setSlides}
                onPreviewSlide={(_slide, index) => setPreviewSlideIndex(index)}
                defaultLayout={layout}
              />
            </div>
          )}
        </div>

        {/* ===== RIGHT: Preview + Status ===== */}
        <div className="space-y-4">
          {/* Preview */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
            {/* Preview header with slide nav */}
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Aprovação
              </h3>
            </div>
            <ApprovalActions piece={piece} accountId={accountId} />
          </div>

          {/* Version history */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="size-4 text-muted-foreground" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Versões
              </h3>
            </div>
            <VersionHistory versions={versions} />
          </div>
        </div>
      </div>
    </div>
  );
}
