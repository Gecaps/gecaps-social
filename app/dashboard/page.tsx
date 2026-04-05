import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  Video,
  LayoutGrid,
  History,
  Sparkles,
} from "lucide-react";
import type { Post } from "@/lib/types";
import { PILAR_LABELS, PILAR_COLORS, STATUS_LABELS, STATUS_COLORS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = new Date().toISOString().split("T")[0];

  const [{ data: posts }, { data: editorialLines }] = await Promise.all([
    supabase()
      .from("social_posts")
      .select("*")
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time", { ascending: true }),
    supabase()
      .from("social_editorial_lines")
      .select("*")
      .eq("active", true),
  ]);

  const allPosts = (posts || []) as Post[];
  const approved = allPosts.filter((p) => p.status === "approved").length;
  const pending = allPosts.filter((p) => p.status === "pending").length;
  const rejected = allPosts.filter((p) => p.status === "rejected").length;
  const published = allPosts.filter((p) => p.status === "published").length;
  const todayPosts = allPosts.filter((p) => p.scheduled_date === today);
  const recentPosts = allPosts.slice(-5).reverse();

  // Pilar distribution
  const pilarCounts: Record<string, number> = {};
  for (const p of allPosts) {
    pilarCounts[p.pilar] = (pilarCounts[p.pilar] || 0) + 1;
  }
  const maxPilar = Math.max(...Object.values(pilarCounts), 1);

  return (
    <div className="pt-4 pb-12 px-4 lg:px-8 min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2">
          Gestao de Conteudo
        </p>
        <h1 className="text-3xl lg:text-4xl font-heading font-extrabold tracking-tight">
          Visao Geral
        </h1>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <KpiCard icon={CheckCircle2} label="Aprovados" value={approved} change="+12%" positive />
        <KpiCard icon={Clock} label="Pendentes" value={pending} change={`${pending}`} positive={false} />
        <KpiCard icon={XCircle} label="Rejeitados" value={rejected} change={`${rejected}`} positive={false} />
        <KpiCard icon={Send} label="Publicados" value={published} change="+8%" positive />
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        {/* Trending Content — 7 cols */}
        <div className="col-span-12 lg:col-span-7">
          <Card className="border-border/10">
            <CardContent className="p-6 lg:p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-heading font-bold">Conteudo Recente</h3>
                <Link href="/calendario" className="text-primary font-bold text-xs hover:underline">
                  Ver calendario
                </Link>
              </div>
              <div className="space-y-5">
                {recentPosts.map((post) => {
                  const previewUrl = `/api/preview?title=${encodeURIComponent(post.title)}&pilar=${post.pilar}&layout=${post.layout || "branco"}&w=120`;
                  return (
                    <Link key={post.id} href={`/post/${post.id}`}>
                      <div className="flex items-center gap-4 group">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img
                            src={previewUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                            {post.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {post.scheduled_date} · {PILAR_LABELS[post.pilar]}
                          </p>
                        </div>
                        <div className="flex gap-4 text-right shrink-0">
                          <div>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[post.status]}`}>
                              {STATUS_LABELS[post.status]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribuicao por Pilar — 5 cols */}
        <div className="col-span-12 lg:col-span-5">
          <Card className="border-border/10">
            <CardContent className="p-6 lg:p-8">
              <h3 className="text-xl font-heading font-bold mb-8">Distribuicao por Pilar</h3>
              <div className="space-y-5">
                {Object.entries(pilarCounts).map(([pilar, count]) => (
                  <div key={pilar}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold flex items-center gap-2">
                        {PILAR_LABELS[pilar as keyof typeof PILAR_LABELS] || pilar}
                      </span>
                      <span className="text-xs font-extrabold">{count}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
                        style={{ width: `${(count / maxPilar) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Recommendation */}
              <div className="mt-8 p-4 bg-muted rounded-xl">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Sparkles className="size-3" /> Recomendacao IA
                </p>
                <p className="text-xs leading-relaxed">
                  Conteudo <span className="text-primary font-bold">Educativo</span> tem melhor engajamento. Considere aumentar a frequencia desse pilar.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts de Hoje — full width */}
        <div className="col-span-12">
          <Card className="border-border/10">
            <CardContent className="p-6 lg:p-8">
              <h3 className="text-xl font-heading font-bold mb-6">
                Posts de Hoje ({todayPosts.length})
              </h3>
              {todayPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhum post agendado pra hoje
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {todayPosts.map((post) => {
                    const previewUrl = `/api/preview?title=${encodeURIComponent(post.title)}&pilar=${post.pilar}&layout=${post.layout || "branco"}&w=300`;
                    return (
                      <Link key={post.id} href={`/post/${post.id}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-border/10">
                          <img
                            src={previewUrl}
                            alt=""
                            className="w-full aspect-[4/5] object-cover"
                            loading="lazy"
                          />
                          <CardContent className="p-4">
                            <p className="font-bold text-sm line-clamp-2 mb-2">{post.title}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-[10px] ${PILAR_COLORS[post.pilar]}`}>
                                {PILAR_LABELS[post.pilar]}
                              </Badge>
                              <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[post.status]}`}>
                                {STATUS_LABELS[post.status]}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  change,
  positive,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: number;
  change: string;
  positive: boolean;
}) {
  return (
    <Card className="border-border/10">
      <CardContent className="p-5 lg:p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="p-2 bg-primary/5 rounded-lg">
            <Icon className="size-[18px] text-primary" />
          </span>
          <span
            className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-full ${
              positive
                ? "text-primary bg-primary/5"
                : "text-destructive bg-destructive/5"
            }`}
          >
            {change}
            {positive ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
          </span>
        </div>
        <p className="text-muted-foreground font-medium text-xs mb-1">{label}</p>
        <p className="text-3xl font-heading font-extrabold">{value}</p>
      </CardContent>
    </Card>
  );
}
