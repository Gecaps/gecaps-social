import { supabase } from "@/lib/supabase";
import { CalendarView } from "@/components/calendar/calendar-view";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const { data: posts } = await supabase()
    .from("social_posts")
    .select("*")
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true });

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-xl font-bold">Calendario</h1>
        <p className="text-sm text-muted-foreground">
          Visualizacao semanal e mensal dos posts
        </p>
      </div>
      <CalendarView posts={posts || []} />
    </div>
  );
}
