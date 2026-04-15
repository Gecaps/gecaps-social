"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  TrendingUp,
  FileText,
  Users,
  Quote,
  Link as LinkIcon,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Globe,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  ResearchSession,
  ResearchResults,
  TrendItem,
  ArticleItem,
} from "@/modules/research/types";

interface TrendResearchProps {
  accountId: string;
  researchSessions: ResearchSession[];
}

export function TrendResearch({
  accountId,
  researchSessions,
}: TrendResearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [activeSession, setActiveSession] = useState<ResearchSession | null>(
    researchSessions.find((s) => s.status === "completed") ?? null
  );
  const [showPastResearch, setShowPastResearch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function showSuccessMsg(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  }

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    setActiveSession(null);

    try {
      const res = await fetch("/api/ai/research-trend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_id: accountId, query: query.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro na pesquisa");
      }

      const session: ResearchSession = await res.json();
      setActiveSession(session);
      setQuery("");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSearching(false);
    }
  }

  async function handleGenerateIdeas() {
    if (!activeSession) return;
    setGeneratingIdeas(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ research_id: activeSession.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao gerar ideias");
      }

      showSuccessMsg("5 ideias geradas com sucesso! Veja no Banco de Ideias.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGeneratingIdeas(false);
    }
  }

  const results = activeSession?.results;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-heading font-bold mb-1">
          Pesquisa de Tendencias
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Pesquise tendencias em tempo real com IA para gerar ideias baseadas em
          dados
        </p>

        <div className="flex gap-3">
          <Input
            placeholder="Ex: suplementos naturais, skincare coreano, marketing de influencia..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !searching && handleSearch()}
            disabled={searching}
            className="flex-1"
          />
          <Button
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="shrink-0 text-white shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-[oklch(0.75_0.15_85)] to-[oklch(0.65_0.25_310)] hover:opacity-90"
          >
            {searching ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Pesquisando...
              </>
            ) : (
              <>
                <Search className="size-4" />
                Pesquisar Tendencias
              </>
            )}
          </Button>
        </div>

        {error && (
          <p className="mt-3 text-sm font-medium text-red-500">{error}</p>
        )}
        {success && (
          <p className="mt-3 text-sm font-medium text-emerald-500">{success}</p>
        )}
      </div>

      {/* Loading State */}
      {searching && <ResearchSkeleton />}

      {/* Results Panel */}
      {results && !searching && (
        <div className="space-y-6">
          {/* Generate Ideas CTA */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Pesquisa concluida</p>
              <p className="text-xs text-muted-foreground">
                Gere ideias de conteudo baseadas nos resultados desta pesquisa
              </p>
            </div>
            <Button
              onClick={handleGenerateIdeas}
              disabled={generatingIdeas}
              className="text-primary-foreground shadow-md hover:shadow-lg transition-all"
              style={{ background: "var(--gradient-primary)" }}
            >
              {generatingIdeas ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Gerar Ideias desta Pesquisa
                </>
              )}
            </Button>
          </div>

          {/* Summary */}
          <section>
            <SectionHeader icon={FileText} title="Resumo" />
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {results.summary}
              </p>
            </div>
          </section>

          {/* Trends */}
          {results.trends.length > 0 && (
            <section>
              <SectionHeader icon={TrendingUp} title="Tendencias" />
              <div className="grid gap-3 sm:grid-cols-2">
                {results.trends.map((trend, i) => (
                  <TrendCard key={i} trend={trend} />
                ))}
              </div>
            </section>
          )}

          {/* Articles */}
          {results.articles.length > 0 && (
            <section>
              <SectionHeader icon={Globe} title="Artigos" />
              <div className="grid gap-3">
                {results.articles.map((article, i) => (
                  <ArticleCard key={i} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* Competitor Angles */}
          {results.competitor_angles.length > 0 && (
            <section>
              <SectionHeader icon={Users} title="Angulos de Concorrentes" />
              <div className="grid gap-3 sm:grid-cols-2">
                {results.competitor_angles.map((angle, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-[0_0_8px_var(--glow-primary)] transition-all duration-200"
                  >
                    <div className="flex gap-2">
                      <Users className="size-4 shrink-0 mt-0.5" style={{ color: "var(--accent-violet)" }} />
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {angle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Expert Opinions */}
          {results.expert_opinions.length > 0 && (
            <section>
              <SectionHeader icon={Quote} title="Opinioes de Especialistas" />
              <div className="grid gap-3 sm:grid-cols-2">
                {results.expert_opinions.map((opinion, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-[0_0_8px_var(--glow-primary)] transition-all duration-200"
                  >
                    <div className="flex gap-2">
                      <Quote className="size-4 shrink-0 mt-0.5" style={{ color: "var(--accent-violet)" }} />
                      <p className="text-sm text-muted-foreground italic leading-relaxed">
                        {opinion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Citations */}
          {results.citations.length > 0 && (
            <section>
              <SectionHeader icon={LinkIcon} title="Fontes" />
              <div className="rounded-xl border border-border bg-card p-4">
                <ul className="space-y-1">
                  {results.citations.map((citation, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      <a
                        href={citation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground hover:underline transition-colors"
                      >
                        [{i + 1}] {citation}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Past Research Sessions */}
      {researchSessions.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <button
            onClick={() => setShowPastResearch(!showPastResearch)}
            className="w-full flex items-center justify-between p-4 text-sm font-medium hover:bg-muted/50 transition-colors rounded-xl"
          >
            <span className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              Pesquisas Anteriores ({researchSessions.length})
            </span>
            {showPastResearch ? (
              <ChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </button>

          {showPastResearch && (
            <div className="border-t border-border divide-y divide-border">
              {researchSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setActiveSession(session)}
                  className={`w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors ${
                    activeSession?.id === session.id ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {session.query}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(session.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-[10px] ${
                      session.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : session.status === "failed"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}
                  >
                    {session.status === "completed"
                      ? "Concluida"
                      : session.status === "failed"
                        ? "Falhou"
                        : "Pendente"}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-bold mb-3">
      <Icon className="size-4 text-primary" />
      {title}
    </h3>
  );
}

function TrendCard({ trend }: { trend: TrendItem }) {
  const relevanceColor =
    trend.relevance >= 8
      ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10"
      : trend.relevance >= 5
        ? "text-amber-500 border-amber-500/20 bg-amber-500/10"
        : "text-red-400 border-red-500/20 bg-red-500/10";

  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold leading-tight">{trend.topic}</h4>
          <Badge
            variant="outline"
            className={`shrink-0 text-[10px] ${relevanceColor}`}
          >
            {trend.relevance}/10
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {trend.description}
        </p>
        <Badge variant="outline" className="text-[10px]">
          {trend.platform}
        </Badge>
      </CardContent>
    </Card>
  );
}

function ArticleCard({ article }: { article: ArticleItem }) {
  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {article.url ? (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold leading-tight hover:underline"
              >
                {article.title}
              </a>
            ) : (
              <h4 className="text-sm font-bold leading-tight">
                {article.title}
              </h4>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              {article.source}
            </p>
          </div>
        </div>
        {article.key_points.length > 0 && (
          <ul className="space-y-1">
            {article.key_points.map((point, i) => (
              <li
                key={i}
                className="text-xs text-muted-foreground flex gap-1.5"
              >
                <span className="shrink-0 text-primary">&#8226;</span>
                {point}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ResearchSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-6 text-center space-y-3">
        <Loader2 className="size-8 animate-spin text-violet-500 mx-auto" />
        <div>
          <p className="text-sm font-bold">Pesquisando tendencias...</p>
          <p className="text-xs text-muted-foreground mt-1">
            Buscando dados em tempo real com IA. Isso pode levar 15-30 segundos.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full" />

        <Skeleton className="h-6 w-28" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    </div>
  );
}
