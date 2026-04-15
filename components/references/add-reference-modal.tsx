"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link as LinkIcon, FileText, Upload, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface AddReferenceModalProps {
  accountId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddReferenceModal({
  accountId,
  open,
  onOpenChange,
}: AddReferenceModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState("link");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Link state
  const [url, setUrl] = useState("");

  // Text state
  const [rawText, setRawText] = useState("");

  // File state
  const [file, setFile] = useState<File | null>(null);

  function reset() {
    setUrl("");
    setRawText("");
    setFile(null);
    setError(null);
    setTab("link");
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      let body: Record<string, unknown>;

      if (tab === "link") {
        if (!url.trim()) throw new Error("Informe uma URL");
        body = {
          account_id: accountId,
          type: "link",
          source_url: url.trim(),
          raw_content: null,
          file_url: null,
          summary: null,
          tags: [],
          suggested_pilar: null,
          suggested_format: null,
          relevance_score: null,
          status: "novo",
        };
      } else if (tab === "text") {
        if (!rawText.trim()) throw new Error("Cole algum conteúdo");
        body = {
          account_id: accountId,
          type: "text",
          source_url: null,
          raw_content: rawText.trim(),
          file_url: null,
          summary: null,
          tags: [],
          suggested_pilar: null,
          suggested_format: null,
          relevance_score: null,
          status: "novo",
        };
      } else {
        // file tab
        if (!file) throw new Error("Selecione um arquivo");

        // Upload file first
        const formData = new FormData();
        formData.append("file", file);
        formData.append("account_id", accountId);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          throw new Error(data.error || "Erro no upload");
        }

        const { file_url } = await uploadRes.json();
        const isPdf = file.name.toLowerCase().endsWith(".pdf");

        body = {
          account_id: accountId,
          type: isPdf ? "pdf" : "file",
          source_url: null,
          raw_content: null,
          file_url,
          summary: null,
          tags: [],
          suggested_pilar: null,
          suggested_format: null,
          relevance_score: null,
          status: "novo",
        };
      }

      const res = await fetch("/api/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao adicionar referência");
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
          <DialogTitle>Adicionar Referência</DialogTitle>
          <DialogDescription>
            Adicione um link, texto ou arquivo para a IA processar
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="link">
              <LinkIcon className="size-3.5" />
              Link
            </TabsTrigger>
            <TabsTrigger value="text">
              <FileText className="size-3.5" />
              Texto
            </TabsTrigger>
            <TabsTrigger value="file">
              <Upload className="size-3.5" />
              Arquivo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="mt-4 space-y-3">
            <div className="space-y-2">
              <label className="block text-sm font-medium">URL</label>
              <Input
                type="url"
                placeholder="https://exemplo.com/artigo"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Cole o link de um artigo, post ou página
              </p>
            </div>
          </TabsContent>

          <TabsContent value="text" className="mt-4 space-y-3">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Conteúdo</label>
              <Textarea
                placeholder="Cole aqui o texto de referência..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="file" className="mt-4 space-y-3">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Arquivo</label>
              <Input
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                PDF ou TXT (max 5MB)
              </p>
            </div>
          </TabsContent>
        </Tabs>

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
                Adicionando...
              </>
            ) : (
              "Adicionar Referência"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
