"use client";

import { useState } from "react";
import { Plus, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReferenceCard } from "@/components/references/reference-card";
import { AddReferenceModal } from "@/components/references/add-reference-modal";
import type { Reference, ReferenceStatus } from "@/modules/references/types";

interface ReferencesPageClientProps {
  accountId: string;
  references: Reference[];
}

type FilterTab = "todos" | "novo" | "triado" | "virou_ideia" | "arquivado";

const filterTabs: { value: FilterTab; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "novo", label: "Novos" },
  { value: "triado", label: "Triados" },
  { value: "virou_ideia", label: "Com ideias" },
  { value: "arquivado", label: "Arquivados" },
];

export function ReferencesPageClient({
  accountId,
  references,
}: ReferencesPageClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("todos");

  const filtered =
    activeFilter === "todos"
      ? references
      : references.filter((r) => r.status === (activeFilter as ReferenceStatus));

  const totalCount = references.length;
  const processedCount = references.filter((r) => r.processed_at !== null).length;
  const withIdeasCount = references.filter(
    (r) => r.status === "virou_ideia"
  ).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-extrabold tracking-tight">
            Referências
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Links, textos e PDFs para a IA processar
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="size-4" />
          Adicionar
        </Button>
      </div>

      {/* Stats */}
      {totalCount > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-border bg-card p-3 text-center transition-all duration-200 hover:border-primary/20">
            <p className="text-lg font-heading font-bold">{totalCount}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center transition-all duration-200 hover:border-primary/20">
            <p className="text-lg font-heading font-bold">{processedCount}</p>
            <p className="text-xs text-muted-foreground">Processadas</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center transition-all duration-200 hover:border-primary/20">
            <p className="text-lg font-heading font-bold">{withIdeasCount}</p>
            <p className="text-xs text-muted-foreground">Com ideias</p>
          </div>
        </div>
      )}

      {/* Filters */}
      {totalCount > 0 && (
        <div className="flex gap-1 mb-6 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((ref) => (
            <ReferenceCard
              key={ref.id}
              reference={ref}
              accountId={accountId}
            />
          ))}
        </div>
      ) : totalCount > 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma referência com este filtro
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
            <Library className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Nenhuma referência ainda</p>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione links, textos ou PDFs para a IA processar.
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} size="sm">
            <Plus className="size-4" />
            Adicionar referência
          </Button>
        </div>
      )}

      {/* Modal */}
      <AddReferenceModal
        accountId={accountId}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
