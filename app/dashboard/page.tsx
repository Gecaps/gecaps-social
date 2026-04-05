import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { EditorialBalance } from "@/components/dashboard/editorial-balance";
import { PILAR_LABELS, PILAR_COLORS, STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import { CheckCircle2, Clock, Calendar } from "lucide-react";
import type { Post } from "@/lib/types";

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

  const stats = {
    approved: allPosts.filter((p) => p.status === "approved").length,
    pending: allPosts.filter((p) => p.status === "pending").length,
    rejected: allPosts.filter((p) => p.status === "rejected").length,
    published: allPosts.filter((p) => p.status === "published").length,
  };

  const todayPosts = allPosts.filter((p) => p.scheduled_date === today);
  const pendingPosts = allPosts.filter((p) => p.status === "pending").slice(0, 5);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumo geral e acoes rapidas
        </p>
      </div>

      <StatsCards
        approved={stats.approved}
        pending={stats.pending}
        rejected={stats.rejected}
        published={stats.published}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Posts de hoje */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="size-4" />
              Posts de hoje ({todayPosts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum post agendado pra hoje
              </p>
            ) : (
              <div className="space-y-3">
                {todayPosts.map((post) => {
                  const previewUrl = `/api/preview?title=${encodeURIComponent(post.title)}&pilar=${post.pilar}&layout=${post.layout || "branco"}&w=120`;
                  return (
                    <Link key={post.id} href={`/post/${post.id}`}>
                      <div className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                        <img
                          src={previewUrl}
                          alt=""
                          className="w-16 aspect-[4/5] rounded object-cover shrink-0"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium line-clamp-2">{post.title}</p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${PILAR_COLORS[post.pilar]}`}>
                              {PILAR_LABELS[post.pilar]}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[post.status]}`}>
                              {STATUS_LABELS[post.status]}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{post.scheduled_time}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <EditorialBalance posts={allPosts} editorialLines={editorialLines || []} />

          {/* Pendentes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4 text-status-pending" />
                Pendentes ({stats.pending})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingPosts.map((post) => (
                  <Link key={post.id} href={`/post/${post.id}`}>
                    <div className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-muted/50">
                      <CheckCircle2 className="size-3 text-status-pending shrink-0" />
                      <p className="truncate text-xs font-medium">{post.title}</p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{post.scheduled_date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
