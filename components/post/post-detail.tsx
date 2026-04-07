"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Sparkles,
  Loader2,
  Save,
} from "lucide-react";
import type { Post, PostVersion, PostLayout } from "@/lib/types";
import {
  PILAR_LABELS,
  PILAR_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/lib/types";
import { LayoutSelector } from "./layout-selector";

interface PostDetailProps {
  post: Post & { account_handle?: string };
  versions: PostVersion[];
}

export function PostDetail({ post, versions }: PostDetailProps) {
  const router = useRouter();
  const handle = post.account_handle || "@gecapsbrasil";

  // Editable fields for the creative
  const [titulo, setTitulo] = useState(cleanMarkdown(post.title));
  const [subtitulo, setSubtitulo] = useState("");
  const [tags, setTags] = useState(
    post.pilar ? PILAR_LABELS[post.pilar]?.toUpperCase() || "" : ""
  );
  const [cta, setCta] = useState(cleanMarkdown(post.cta || ""));
  const [highlight, setHighlight] = useState("");
  const [bigNum, setBigNum] = useState("");
  const [layout, setLayout] = useState<PostLayout>(
    (post.layout as PostLayout) || "branco"
  );
  const badge = PILAR_LABELS[post.pilar] || post.pilar;

  // Caption
  const [caption, setCaption] = useState(post.caption || "");
  const [hashtags, setHashtags] = useState(post.hashtags || "");

  // States
  const [downloading, setDownloading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Editable image URL for foto-premium
  const [imageUrl, setImageUrl] = useState("");

  // Build Satori preview URL (fast, low-res)
  const templateMap: Record<string, string> = { branco: "branco", verde: "verde", quote: "quote", foto: "foto" };
  const template = templateMap[layout] || "branco";
  const previewParams = new URLSearchParams({
    title: titulo,
    pilar: post.pilar,
    layout: template,
    handle,
    w: "540",
  });
  if (subtitulo) previewParams.set("subtitle", subtitulo);
  if (tags) previewParams.set("tags", tags);
  if (cta) previewParams.set("cta", cta);
  if (highlight) previewParams.set("highlight", highlight);
  if (bigNum) previewParams.set("bigNum", bigNum);
  const previewUrl = `/api/preview?${previewParams.toString()}`;

  // Build Cloudflare render URL (HD)
  function getRenderUrl() {
    const renderTemplate = layout === "foto" ? "foto-premium" : template;
    const params = new URLSearchParams({
      template: renderTemplate,
      title: titulo,
      badge,
      handle,
    });
    if (subtitulo) params.set("subtitle", subtitulo);
    if (tags) params.set("tags", tags);
    if (cta) params.set("cta", cta);
    if (highlight) params.set("highlight", highlight);
    if (bigNum) params.set("bigNum", bigNum);
    if (imageUrl) params.set("image", imageUrl);
    return `/api/render?${params.toString()}`;
  }

  async function handleDownload() {
    setDownloading(true);
    showToast("Gerando imagem HD...");
    try {
      const res = await fetch(getRenderUrl());
      if (!res.ok) throw new Error("Falha");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gecaps-${post.scheduled_date}-${template}.png`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Imagem HD baixada!");
    } catch {
      showToast("Erro ao gerar. Tente novamente.");
    }
    setDownloading(false);
  }

  async function handleGenerateAI() {
    setGeneratingAI(true);
    try {
      const res = await fetch("/api/posts/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titulo,
          hook: subtitulo || tags,
          pilar: post.pilar,
          cta,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCaption(data.caption);
        setHashtags(data.hashtags);
        showToast("Legenda gerada!");
      }
    } catch {
      showToast("Erro ao gerar legenda.");
    }
    setGeneratingAI(false);
  }

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: titulo,
        cta,
        caption: caption || null,
        hashtags: hashtags || null,
        layout: template,
      }),
    });
    showToast("Salvo!");
    setSaving(false);
    router.refresh();
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/calendario">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-heading font-bold">Editor de Criativo</h1>
          <p className="text-xs text-muted-foreground">
            {post.scheduled_date} · {post.scheduled_time} · {post.format}
          </p>
        </div>
        <Badge variant="outline" className={PILAR_COLORS[post.pilar]}>
          {PILAR_LABELS[post.pilar]}
        </Badge>
        <Badge variant="outline" className={STATUS_COLORS[post.status]}>
          {STATUS_LABELS[post.status]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Left: Editor */}
        <div className="space-y-4">
          {/* Rascunho do Trello */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Rascunho do Trello</p>
              <p className="text-xs text-muted-foreground whitespace-pre-line">
                {post.hook || post.title}
              </p>
            </CardContent>
          </Card>

          {/* Titulo */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Titulo do Post *
            </label>
            <textarea
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-lg font-bold leading-tight placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
              placeholder="Ex: O superativo que a ciencia comprova"
            />
          </div>

          {/* Subtitulo */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Subtitulo
            </label>
            <input
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: Anti-inflamatorio. Antioxidante."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Tags */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tags (separar com ·)
              </label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="CURCUMA · SUPLEMENTO"
              />
            </div>

            {/* CTA */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                CTA
              </label>
              <input
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Saiba mais"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Highlight */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Destaque (palavras com fundo verde)
              </label>
              <input
                value={highlight}
                onChange={(e) => setHighlight(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="comprova, adora"
              />
            </div>

            {/* Big Number */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Numero decorativo
              </label>
              <input
                value={bigNum}
                onChange={(e) => setBigNum(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="5"
                maxLength={2}
              />
            </div>
          </div>

          {/* Image URL for foto-premium */}
          {layout === "foto" && (
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                URL da imagem de fundo
              </label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Cole a URL da imagem (Pexels, Unsplash, etc)"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Dica: busque no <a href="https://www.pexels.com/pt-br/procurar/cosmeticos/" target="_blank" rel="noopener" className="text-primary underline">Pexels</a> e cole o link da imagem
              </p>
            </div>
          )}

          {/* Legenda */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Legenda Instagram
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateAI}
                disabled={generatingAI}
                className="text-primary hover:text-primary/80 text-xs h-7"
              >
                {generatingAI ? <Loader2 className="size-3 animate-spin mr-1" /> : <Sparkles className="size-3 mr-1" />}
                {generatingAI ? "Gerando..." : "Gerar com IA"}
              </Button>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={4}
              placeholder="Escreva a legenda ou clique em 'Gerar com IA'..."
            />
            <input
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-2 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="#gecaps #cosmeticos #marcapropria"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="outline"
              className="flex-1"
            >
              <Save className="size-4" />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
            >
              <Download className={`size-4 ${downloading ? "animate-pulse" : ""}`} />
              {downloading ? "Gerando HD..." : "Baixar Imagem HD"}
            </Button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-3">
          <LayoutSelector selected={layout} onSelect={(l) => setLayout(l)} />
          <Card className="overflow-hidden sticky top-20">
            <CardContent className="p-0">
              <Image
                key={`${layout}-${titulo}-${tags}-${cta}-${highlight}-${bigNum}-${subtitulo}`}
                src={previewUrl}
                alt="Preview"
                width={540}
                height={layout === "quote" ? 540 : 675}
                className="w-full"
                unoptimized
              />
            </CardContent>
          </Card>
          <p className="text-[10px] text-center text-muted-foreground">
            Preview rapido (Satori). Clique "Baixar Imagem HD" pra versao final.
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-card px-5 py-2.5 text-sm font-semibold shadow-lg border border-border lg:bottom-6">
          {toast}
        </div>
      )}
    </div>
  );
}

// Remove markdown formatting from Trello text
function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/_/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/·/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
