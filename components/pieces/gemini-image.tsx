"use client";

import { useState } from "react";
import { Sparkles, Loader2, Wand2, ImagePlus } from "lucide-react";

interface GeminiImageProps {
  onImageGenerated: (url: string) => void;
  currentImageUrl?: string;
  creativeBrief?: string;
  accountId: string;
}

const STYLE_PRESETS = [
  { label: "Capa de Revista", prompt: "editorial magazine cover, high fashion photography, cinematic lighting, professional studio quality" },
  { label: "Produto Premium", prompt: "premium product photography, clean white background, studio lighting, commercial quality" },
  { label: "Lifestyle Saúde", prompt: "healthy lifestyle photography, natural lighting, warm tones, wellness aesthetic" },
  { label: "Minimalista", prompt: "minimalist aesthetic, clean lines, soft shadows, editorial photography" },
  { label: "Bold & Colorido", prompt: "vibrant colors, bold composition, dynamic lighting, modern graphic style" },
  { label: "Natureza & Bem-estar", prompt: "nature wellness, organic textures, green tones, peaceful atmosphere" },
];

export function GeminiImage({
  onImageGenerated,
  currentImageUrl,
  creativeBrief,
  accountId,
}: GeminiImageProps) {
  const [prompt, setPrompt] = useState(creativeBrief ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"generate" | "enhance">(
    currentImageUrl ? "enhance" : "generate"
  );

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageUrl: mode === "enhance" ? currentImageUrl : undefined,
          mode,
          accountId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao gerar imagem");
      }

      const data = await res.json();
      onImageGenerated(data.imageUrl);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
        <button
          type="button"
          onClick={() => setMode("generate")}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
            mode === "generate"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ImagePlus className="size-3.5" />
          Criar imagem
        </button>
        <button
          type="button"
          onClick={() => setMode("enhance")}
          disabled={!currentImageUrl}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-40 ${
            mode === "enhance"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wand2 className="size-3.5" />
          Melhorar foto
        </button>
      </div>

      {/* Style presets */}
      <div>
        <p className="mb-1.5 text-[11px] text-muted-foreground">Estilos rápidos:</p>
        <div className="flex flex-wrap gap-1.5">
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setPrompt(preset.prompt)}
              className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground hover:shadow-[0_0_6px_var(--glow-primary)] transition-all"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt input */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        placeholder={
          mode === "generate"
            ? "Descreva a imagem que quer criar... ex: modelo feminina olhar editorial, fundo neutro, iluminação de estúdio"
            : "O que quer melhorar? ex: melhorar iluminação, remover fundo, estilo editorial..."
        }
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
      />

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Generate button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-[var(--accent-violet,oklch(0.65_0.2_300))] px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {mode === "generate" ? "Criando imagem..." : "Melhorando..."}
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            {mode === "generate" ? "Gerar com Nano Banana" : "Melhorar com IA"}
          </>
        )}
      </button>

      {loading && (
        <p className="text-center text-[11px] text-muted-foreground">
          Isso pode levar 15-30 segundos...
        </p>
      )}
    </div>
  );
}
