import { supabase } from "@/lib/supabase";
import { CalendarView } from "@/components/calendar/calendar-view";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  // Auto-sync Trello (fire and forget, don't block page load)
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  fetch(`${baseUrl}/api/trello/sync`, { next: { revalidate: 300 } }).catch(
    () => {}
  );

  const [{ data: posts }, { data: accounts }] = await Promise.all([
    supabase()
      .from("social_posts")
      .select("*")
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time", { ascending: true }),
    supabase()
      .from("social_accounts")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: true }),
  ]);

  return (
    <div className="space-y-4 p-4 lg:px-8 lg:pt-6 lg:pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Calendario</h1>
          <p className="text-sm text-muted-foreground">
            Clique num post pra editar ou no + pra criar
          </p>
        </div>
      </div>
      <CalendarView posts={posts || []} accounts={accounts || []} />
    </div>
  );
}
