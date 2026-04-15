"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateIdeaModalProps {
  accountId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatOptions = [
  { value: "estatico", label: "Estatico" },
  { value: "carrossel", label: "Carrossel" },
  { value: "reels", label: "Reels" },
  { value: "story", label: "Story" },
];

export function CreateIdeaModal({
  accountId,
  open,
  onOpenChange,
}: CreateIdeaModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [theme, setTheme] = useState("");
  const [angle, setAngle] = useState("");
  const [objective, setObjective] = useState("");
  const [suggestedFormat, setSuggestedFormat] = useState("");
  const [justification, setJustification] = useState("");

  function reset() {
    setTheme("");
    setAngle("");
    setObjective("");
    setSuggestedFormat("");
    setJustification("");
    setError(null);
  }

  async function handleSubmit() {
    if (!theme.trim()) {
      setError("O tema e obrigatorio");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const body = {
        account_id: accountId,
        theme: theme.trim(),
        angle: angle.trim() || null,
        objective: objective.trim() || null,
        suggested_format: suggestedFormat || null,
        justification: justification.trim() || null,
        is_manual: true,
        status: "pending",
        reference_id: null,
        brand_fit: null,
      };

      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar ideia");
      }

      reset();
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) reset();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Ideia</DialogTitle>
          <DialogDescription>
            Crie uma ideia de conteudo manualmente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Theme */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Tema da ideia <span className="text-red-400">*</span>
            </label>
            <Input
              placeholder="Ex: Beneficios do colageno para pele"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />
          </div>

          {/* Angle */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Angulo editorial
            </label>
            <Input
              placeholder="Ex: Mitos vs realidade"
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
            />
          </div>

          {/* Objective */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Objetivo do post
            </label>
            <Textarea
              placeholder="O que este post deve alcançar?"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Format */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Formato sugerido
            </label>
            <Select value={suggestedFormat} onValueChange={(v) => setSuggestedFormat(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um formato" />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Justification */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Justificativa</label>
            <Textarea
              placeholder="Por que essa ideia e relevante?"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 font-medium">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Ideia"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
