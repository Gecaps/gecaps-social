"use client";

import { useState } from "react";
import { Plus, Lightbulb, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IdeaCard } from "@/components/ideas/idea-card";
import { CreateIdeaModal } from "@/components/ideas/create-idea-modal";
import { TrendResearch } from "@/components/ideas/trend-research";
import type { Idea, IdeaStatus } from "@/modules/ideas/types";
import type { ResearchSession } from "@/modules/research/types";

interface IdeasPageClientProps {
  accountId: string;
  ideas: Idea[];
  researchSessions: ResearchSession[];
}

type FilterTab = "todas" | "pending" | "approved" | "rejected";

const filterTabs: { value: FilterTab; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "pending", label: "Pendentes" },
  { value: "approved", label: "Aprovadas" },
  { value: "rejected", label: "Rejeitadas" },
];

type PageTab = "ideias" | "pesquisa";

export function IdeasPageClient({
  accountId,
  ideas,
  researchSessions,
}: IdeasPageClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("todas");
  const [activeTab, setActiveTab] = useState<PageTab>("ideias");

  const filtered =
    activeFilter === "todas"
      ? ideas
      : ideas.filter((i) => i.status === (activeFilter as IdeaStatus));

  const totalCount = ideas.length;
  const pendingCount = ideas.filter((i) => i.status === "pending").length;
  const approvedCount = ideas.filter((i) => i.status === "approved").length;
  const rejectedCount = ideas.filter((i) => i.status === "rejected").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-extrabold tracking-tight">
            Ideias
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Banco de ideias geradas e manuais
          </p>
        </div>
        {activeTab === "ideias" && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="size-4" />
            Nova Ideia
          </Button>
        )}
      </div>

      {/* Page Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border pb-0">
        <button
          onClick={() => setActiveTab("ideias")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "ideias"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Lightbulb className="size-4" />
          Banco de Ideias
        </button>
        <button
          onClick={() => setActiveTab("pesquisa")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "pesquisa"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="size-4" />
          Pesquisa de Tendencias
        </button>
      </div>

      {/* Pesquisa Tab */}
      {activeTab === "pesquisa" && (
        <TrendResearch
          accountId={accountId}
          researchSessions={researchSessions}
        />
      )}

      {/* Ideias Tab - Stats */}
      {activeTab === "ideias" && (
        <>
      {/* Stats */}
      {totalCount > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-lg font-heading font-bold">{totalCount}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-center">
            <p className="text-lg font-heading font-bold text-amber-500">
              {pendingCount}
            </p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
            <p className="text-lg font-heading font-bold text-emerald-500">
              {approvedCount}
            </p>
            <p className="text-xs text-muted-foreground">Aprovadas</p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-center">
            <p className="text-lg font-heading font-bold text-red-400">
              {rejectedCount}
            </p>
            <p className="text-xs text-muted-foreground">Rejeitadas</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} accountId={accountId} />
          ))}
        </div>
      ) : totalCount > 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma ideia com este filtro
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
            <Lightbulb className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Nenhuma ideia ainda</p>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione referências para a IA gerar ideias, ou crie manualmente.
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} size="sm">
            <Plus className="size-4" />
            Nova Ideia
          </Button>
        </div>
      )}
        </>
      )}

      {/* Modal */}
      <CreateIdeaModal
        accountId={accountId}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
