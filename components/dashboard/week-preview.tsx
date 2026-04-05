import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/lib/types";
import { PILAR_LABELS, PILAR_COLORS, STATUS_COLORS, STATUS_LABELS } from "@/lib/types";

interface WeekPreviewProps {
  posts: Post[];
}

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export function WeekPreview({ posts }: WeekPreviewProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Proximos posts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {posts.map((post) => {
            const date = new Date(post.scheduled_date + "T12:00:00");
            const dayName = DAY_NAMES[date.getDay()];
            const dayNum = date.getDate();
            const isToday = post.scheduled_date === today;

            return (
              <div
                key={post.id}
                className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
              >
                <div
                  className={`flex size-10 shrink-0 flex-col items-center justify-center rounded-lg text-xs ${
                    isToday
                      ? "bg-gradient-to-br from-neon-cyan to-neon-pink text-white font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="text-[10px] uppercase leading-none">
                    {dayName}
                  </span>
                  <span className="text-sm font-bold leading-none">
                    {dayNum}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{post.title}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${PILAR_COLORS[post.pilar]}`}
                    >
                      {PILAR_LABELS[post.pilar]}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[post.status]}`}
                    >
                      {STATUS_LABELS[post.status]}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {post.scheduled_time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
