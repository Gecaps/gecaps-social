"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { BrandPlaybook } from "@/modules/playbook/types";

interface PlaybookFormProps {
  accountId: string;
  playbook: BrandPlaybook | null;
}

export function PlaybookForm({ accountId, playbook }: PlaybookFormProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [toneOfVoice, setToneOfVoice] = useState(playbook?.tone_of_voice || "");
  const [style, setStyle] = useState(playbook?.style || "");
  const [mandatoryWords, setMandatoryWords] = useState(
    playbook?.mandatory_words?.join(", ") || ""
  );
  const [forbiddenWords, setForbiddenWords] = useState(
    playbook?.forbidden_words?.join(", ") || ""
  );
  const [defaultCta, setDefaultCta] = useState(playbook?.default_cta || "");
  const [doExamples, setDoExamples] = useState(playbook?.do_examples || "");
  const [dontExamples, setDontExamples] = useState(playbook?.dont_examples || "");
  const [extraInstructions, setExtraInstructions] = useState(
    playbook?.extra_instructions || ""
  );

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch("/api/playbook", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: accountId,
          tone_of_voice: toneOfVoice || null,
          style: style || null,
          mandatory_words: mandatoryWords
            .split(",")
            .map((w) => w.trim())
            .filter(Boolean),
          forbidden_words: forbiddenWords
            .split(",")
            .map((w) => w.trim())
            .filter(Boolean),
          default_cta: defaultCta || null,
          do_examples: doExamples || null,
          dont_examples: dontExamples || null,
          extra_instructions: extraInstructions || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
  const textareaClass =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="space-y-6">
      {/* Tom e Estilo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tom e Estilo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Tom de voz</label>
            <input
              type="text"
              value={toneOfVoice}
              onChange={(e) => setToneOfVoice(e.target.value)}
              placeholder="Ex: profissional, amigável, direto"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Estilo</label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="Ex: clean, minimalista, ousado"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">CTA padrão</label>
            <input
              type="text"
              value={defaultCta}
              onChange={(e) => setDefaultCta(e.target.value)}
              placeholder="Ex: Saiba mais no link da bio"
              className={inputClass}
            />
          </div>
        </CardContent>
      </Card>

      {/* Vocabulario */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vocabulário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Palavras obrigatórias
            </label>
            <input
              type="text"
              value={mandatoryWords}
              onChange={(e) => setMandatoryWords(e.target.value)}
              placeholder="Separadas por virgula"
              className={inputClass}
            />
            <p className="text-xs text-muted-foreground">
              Termos que devem aparecer no conteúdo
            </p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Palavras proibidas
            </label>
            <input
              type="text"
              value={forbiddenWords}
              onChange={(e) => setForbiddenWords(e.target.value)}
              placeholder="Separadas por virgula"
              className={inputClass}
            />
            <p className="text-xs text-muted-foreground">
              Termos que nunca devem ser usados
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Exemplos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exemplos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              O que fazer (do&apos;s)
            </label>
            <textarea
              value={doExamples}
              onChange={(e) => setDoExamples(e.target.value)}
              placeholder="Exemplos de boas práticas para o conteúdo"
              className={textareaClass}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              O que NÃO fazer (dont&apos;s)
            </label>
            <textarea
              value={dontExamples}
              onChange={(e) => setDontExamples(e.target.value)}
              placeholder="Exemplos do que evitar"
              className={textareaClass}
            />
          </div>
        </CardContent>
      </Card>

      {/* Instrucoes Extras */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instruções Extras</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={extraInstructions}
            onChange={(e) => setExtraInstructions(e.target.value)}
            placeholder="Qualquer instrução adicional para a IA ou equipe"
            className={textareaClass}
          />
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="px-8"
        >
          {saving ? "Salvando..." : "Salvar playbook"}
        </Button>
        {saved && (
          <span className="text-sm text-emerald-500 font-medium">
            Salvo com sucesso!
          </span>
        )}
        {error && (
          <span className="text-sm text-red-500 font-medium">{error}</span>
        )}
      </div>
    </div>
  );
}
