"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Piece, PieceVersion } from "@/modules/pieces/types";
import type { PieceLayout } from "@/modules/accounts/types";
import { PILAR_LABELS } from "@/modules/accounts/types";
import { LayoutSelector } from "./layout-selector";
import { ApprovalActions } from "./approval-actions";
import { VersionHistory } from "./version-history";
import {
  ArrowLeft,
  Download,
  Sparkles,
  Loader2,
  Save,
  Eye,
  Image as ImageIcon,
} from "lucide-react";

interface PieceEditorProps {
  piece: Piece;
  versions: PieceVersion[];
  accountId: string;
}

// Template mapping for HD render
const RENDER_TEMPLATE: Record<PieceLayout, string> = {
  branco: "branco",
  verde: "verde",
  quote: "quote",
  foto: "foto-premium",
};

export function PieceEditor({ piece, versions, accountId }: PieceEditorProps) {
  const router = useRouter();

  // --- Persisted fields (saved to DB) ---
  const [title, setTitle] = useState(piece.title);
  const [caption, setCaption] = useState(piece.caption ?? "");
  const [hashtags, setHashtags] = useState(piece.hashtags ?? "");
  const [cta, setCta] = useState(piece.cta ?? "");
  const [imageUrl, setImageUrl] = useState(piece.image_url ?? "");
  const [layout, setLayout] = useState<PieceLayout>(piece.layout);
  const [creativeBrief, setCreativeBrief] = useState(
    piece.creative_brief ?? ""
  );
  const [visualDirection, setVisualDirection] = useState(
    piece.visual_direction ?? ""
  );

  // --- Visual-only fields (preview/render params, not saved to piece) ---
  const [subtitle, setSubtitle] = useState("");
  const [tags, setTags] = useState("");
  const [highlight, setHighlight] = useState("");
  const [bigNum, setBigNum] = useState("");

  // --- UI state ---
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handle = piece.hook ?? "@gecapsbrasil";
  const badge = PILAR_LABELS[piece.pilar] ?? piece.pilar;

  // --- Preview URL (Satori, updates live) ---
  const previewUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("title", title);
    params.set("pilar", piece.pilar);
    params.set("layout", layout);
    params.set("handle", handle);
    params.set("w", "540");
    if (subtitle) params.set("subtitle", subtitle);
    if (tags) params.set("tags", tags);
    if (cta) params.set("cta", cta);
    if (highlight) params.set("highlight", highlight);
    if (bigNum) params.set("bigNum", bigNum);
    return `/api/preview?${params.toString()}`;
  }, [title, piece.pilar, layout, handle, subtitle, tags, cta, highlight, bigNum]);

  // --- Render URL (Cloudflare HD) ---
  const renderUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("template", RENDER_TEMPLATE[layout]);
    params.set("title", title);
    params.set("badge", badge);
    params.set("handle", handle);
    if (subtitle) params.set("subtitle", subtitle);
    if (tags) params.set("tags", tags);
    if (cta) params.set("cta", cta);
    if (highlight) params.set("highlight", highlight);
    if (bigNum) params.set("bigNum", bigNum);
    if (imageUrl) params.set("image", imageUrl);
    return `/api/render?${params.toString()}`;
  }, [title, layout, badge, handle, subtitle, tags, cta, highlight, bigNum, imageUrl]);

  // --- Show feedback briefly ---
  const showFeedback = useCallback(
    (type: "success" | "error", message: string) => {
      setFeedback({ type, message });
      setTimeout(() => setFeedback(null), 3000);
    },
    []
  );

  // --- Save handler ---
  async function handleSave() {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title,
        caption: caption || null,
        hashtags: hashtags || null,
        cta: cta || null,
        image_url: imageUrl || null,
        layout,
        creative_brief: creativeBrief || null,
        visual_direction: visualDirection || null,
      };

      const res = await fetch(`/api/pieces/${piece.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar");
      }

      showFeedback("success", "Salvo com sucesso!");
      router.refresh();
    } catch (err) {
      showFeedback("error", (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // --- Download HD handler ---
  async function handleDownloadHD() {
    setDownloading(true);
    try {
      const res = await fetch(renderUrl);
      if (!res.ok) throw new Error("Erro ao renderizar imagem HD");

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
    } catch (err) {
      showFeedback("error", (err as Error).message);
    } finally {
      setDownloading(false);
    }
  }

  // --- Generate caption with AI ---
  async function handleGenerateCaption() {
    setGeneratingCaption(true);
    try {
      const res = await fetch("/api/ai/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          hook: piece.hook,
          pilar: piece.pilar,
          cta: cta || undefined,
          account_id: piece.account_id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao gerar legenda");
      }

      const data = await res.json();
      const fullCaption = data.caption as string;

      // Try to separate hashtags from caption
      const hashtagMatch = fullCaption.match(/(#\w[\w\d]*(?:\s+#\w[\w\d]*)+)\s*$/);
      if (hashtagMatch) {
        const extractedHashtags = hashtagMatch[1];
        const captionOnly = fullCaption
          .slice(0, fullCaption.lastIndexOf(extractedHashtags))
          .trim();
        setCaption(captionOnly);
        setHashtags(extractedHashtags);
      } else {
        setCaption(fullCaption);
      }

      showFeedback("success", "Legenda gerada com IA!");
    } catch (err) {
      showFeedback("error", (err as Error).message);
    } finally {
      setGeneratingCaption(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(`/${accountId}/pipeline`)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-heading text-lg font-bold truncate">
            Editor de Peca
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            {piece.title}
          </p>
        </div>

        {/* Feedback toast inline */}
        {feedback && (
          <div
            className={`rounded-lg px-3 py-1.5 text-xs font-medium animate-in fade-in ${
              feedback.type === "success"
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>

      {/* Grid: Editor | Preview */}
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* ===== LEFT COLUMN: Editor fields ===== */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Titulo
            </label>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Titulo do post..."
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Subtitulo
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Subtitulo opcional..."
            />
          </div>

          {/* Tags + CTA row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Tags (separadas por ·)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="SAUDE · BEM-ESTAR"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                CTA
              </label>
              <input
                type="text"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Saiba mais"
              />
            </div>
          </div>

          {/* Highlight + Big number row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Highlight words (virgula)
              </label>
              <input
                type="text"
                value={highlight}
                onChange={(e) => setHighlight(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="saude, natural"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Big number (max 2)
              </label>
              <input
                type="text"
                value={bigNum}
                onChange={(e) =>
                  setBigNum(e.target.value.slice(0, 2))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="5x"
                maxLength={2}
              />
            </div>
          </div>

          {/* Image URL (only for foto layout) */}
          {layout === "foto" && (
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <ImageIcon className="size-3.5" />
                URL da imagem
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="https://..."
              />
            </div>
          )}

          {/* Creative brief */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Briefing criativo
            </label>
            <textarea
              value={creativeBrief}
              onChange={(e) => setCreativeBrief(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Briefing para designer ou IA visual..."
            />
          </div>

          {/* Visual direction */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Direcao visual
            </label>
            <textarea
              value={visualDirection}
              onChange={(e) => setVisualDirection(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Cores, mood, estilo..."
            />
          </div>

          {/* Caption */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Legenda
              </label>
              <button
                type="button"
                onClick={handleGenerateCaption}
                disabled={generatingCaption || !title}
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                {generatingCaption ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
                Gerar com IA
              </button>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Legenda do post..."
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Hashtags
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="#gecaps #saude #suplementos"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-card transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Salvar
            </button>
            <button
              type="button"
              onClick={handleDownloadHD}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Baixar HD
            </button>
          </div>
        </div>

        {/* ===== RIGHT COLUMN: Preview + controls ===== */}
        <div className="space-y-5">
          {/* Layout selector */}
          <div>
            <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Layout
            </h3>
            <LayoutSelector selected={layout} onSelect={setLayout} />
          </div>

          {/* Satori preview */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
              <Eye className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Preview
              </span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={previewUrl}
              src={previewUrl}
              alt="Preview do post"
              className="w-full"
            />
            <p className="px-3 py-2 text-[10px] text-muted-foreground">
              Preview rapido (Satori). Clique &quot;Baixar HD&quot; pra versao
              final.
            </p>
          </div>

          {/* Approval actions */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Aprovacao
            </h3>
            <ApprovalActions piece={piece} accountId={accountId} />
          </div>

          {/* Version history */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Historico de versoes
            </h3>
            <VersionHistory versions={versions} />
          </div>
        </div>
      </div>
    </div>
  );
}
