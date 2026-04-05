"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface GenerateCaptionButtonProps {
  postId: string;
  onGenerated: (caption: string, hashtags: string) => void;
}

export function GenerateCaptionButton({ postId, onGenerated }: GenerateCaptionButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/generate`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        onGenerated(data.caption, data.hashtags);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={loading}
      className="border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Sparkles className="size-4" />
      )}
      {loading ? "Gerando..." : "Gerar com IA"}
    </Button>
  );
}
