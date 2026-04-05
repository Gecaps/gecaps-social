import { supabase } from "@/lib/supabase";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { PostOfDay } from "@/components/dashboard/post-of-day";
import { WeekPreview } from "@/components/dashboard/week-preview";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = new Date().toISOString().split("T")[0];

  const { data: posts } = await supabase()
    .from("social_posts")
    .select("*")
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true });

  const allPosts = posts || [];

  const stats = {
    approved: allPosts.filter((p) => p.status === "approved").length,
    pending: allPosts.filter((p) => p.status === "pending").length,
    rejected: allPosts.filter((p) => p.status === "rejected").length,
    published: allPosts.filter((p) => p.status === "published").length,
  };

  const todayPost = allPosts.find(
    (p) => p.scheduled_date === today && p.status === "pending"
  );

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumo da semana e post do dia
        </p>
      </div>

      <StatsCards
        approved={stats.approved}
        pending={stats.pending}
        rejected={stats.rejected}
        published={stats.published}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {todayPost ? (
          <PostOfDay post={todayPost} />
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border p-12">
            <p className="text-sm text-muted-foreground">
              Nenhum post pendente para hoje
            </p>
          </div>
        )}

        <WeekPreview posts={allPosts} />
      </div>
    </div>
  );
}
