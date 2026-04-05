import { supabase } from "@/lib/supabase";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { PostOfDay } from "@/components/dashboard/post-of-day";
import { WeekPreview } from "@/components/dashboard/week-preview";
import { EditorialBalance } from "@/components/dashboard/editorial-balance";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>;
}) {
  const { account } = await searchParams;
  const today = new Date().toISOString().split("T")[0];

  let postsQuery = supabase()
    .from("social_posts")
    .select("*")
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true });

  if (account) postsQuery = postsQuery.eq("account_id", account);

  const [{ data: posts }, { data: editorialLines }] = await Promise.all([
    postsQuery,
    account
      ? supabase()
          .from("social_editorial_lines")
          .select("*")
          .eq("account_id", account)
          .eq("active", true)
      : supabase()
          .from("social_editorial_lines")
          .select("*")
          .eq("active", true),
  ]);

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

        <div className="space-y-6">
          <EditorialBalance
            posts={allPosts}
            editorialLines={editorialLines || []}
          />
          <WeekPreview posts={allPosts} />
        </div>
      </div>
    </div>
  );
}
