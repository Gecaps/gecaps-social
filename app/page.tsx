import { StatsCards } from "@/components/dashboard/stats-cards";
import { PostOfDay } from "@/components/dashboard/post-of-day";
import { WeekPreview } from "@/components/dashboard/week-preview";
import { getWeekStats, getTodayPost, getWeekPosts } from "@/lib/mock-data";

export default function DashboardPage() {
  const stats = getWeekStats();
  const todayPost = getTodayPost();
  const weekPosts = getWeekPosts();

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

        <WeekPreview posts={weekPosts} />
      </div>
    </div>
  );
}
