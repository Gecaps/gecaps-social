"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { Piece } from "@/modules/pieces/types";

interface MetricInputProps {
  publishedPieces: Piece[];
  accountId: string;
}

export function MetricInput({ publishedPieces, accountId }: MetricInputProps) {
  const router = useRouter();
  const [selectedPieceId, setSelectedPieceId] = useState<string>("");
  const [likes, setLikes] = useState("");
  const [comments, setComments] = useState("");
  const [shares, setShares] = useState("");
  const [saves, setSaves] = useState("");
  const [reach, setReach] = useState("");
  const [impressions, setImpressions] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function resetForm() {
    setSelectedPieceId("");
    setLikes("");
    setComments("");
    setShares("");
    setSaves("");
    setReach("");
    setImpressions("");
    setNotes("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPieceId) {
      setError("Selecione uma peça.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const body = {
        piece_id: selectedPieceId,
        likes: Number(likes) || 0,
        comments: Number(comments) || 0,
        shares: Number(shares) || 0,
        saves: Number(saves) || 0,
        reach: Number(reach) || 0,
        impressions: Number(impressions) || 0,
        notes: notes || null,
        source: "manual" as const,
        recorded_at: new Date().toISOString(),
      };

      const res = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar métricas");
      }

      setSuccess("Métricas registradas com sucesso!");
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-base font-heading font-bold mb-4 px-1">
        Registrar Métricas
      </h2>

      {publishedPieces.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <ClipboardList className="size-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhuma peça publicada sem métricas.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Piece selector */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Peça
            </label>
            <Select
              value={selectedPieceId}
              onValueChange={(v) => setSelectedPieceId(v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar peça..." />
              </SelectTrigger>
              <SelectContent>
                {publishedPieces.map((piece) => (
                  <SelectItem key={piece.id} value={piece.id}>
                    {piece.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number fields - 2 columns */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Likes
              </label>
              <Input
                type="number"
                min="0"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Comentários
              </label>
              <Input
                type="number"
                min="0"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Compartilhamentos
              </label>
              <Input
                type="number"
                min="0"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Salvamentos
              </label>
              <Input
                type="number"
                min="0"
                value={saves}
                onChange={(e) => setSaves(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Alcance
              </label>
              <Input
                type="number"
                min="0"
                value={reach}
                onChange={(e) => setReach(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Impressões
              </label>
              <Input
                type="number"
                min="0"
                value={impressions}
                onChange={(e) => setImpressions(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Observações
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas sobre a performance..."
              className="min-h-12"
            />
          </div>

          {/* Submit */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Salvar Métricas
              </>
            )}
          </Button>

          {/* Feedback */}
          {success && (
            <p className="text-xs font-medium text-emerald-500">{success}</p>
          )}
          {error && (
            <p className="text-xs font-medium text-red-500">{error}</p>
          )}
        </form>
      )}
    </div>
  );
}
