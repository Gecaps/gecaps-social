import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/lib/types";
import { PILAR_LABELS, PILAR_COLORS, STATUS_COLORS } from "@/lib/types";

interface WeekViewProps {
  posts: Post[];
  currentDate: Date;
}

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const STATUS_BORDER: Record<string, string> = {
  pending: "border-l-status-pending",
  approved: "border-l-status-approved",
  rejected: "border-l-status-rejected",
  published: "border-l-status-published",
};

export function WeekView({ posts, currentDate }: WeekViewProps) {
  const weekStart = getWeekStart(currentDate);
  const today = new Date().toISOString().split("T")[0];

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const dateStr = fmt(day);
        const dayPosts = posts.filter((p) => p.scheduled_date === dateStr);
        const isToday = dateStr === today;

        return (
          <div key={dateStr} className="min-h-[180px]">
            <div
              className={`mb-2 text-center text-xs font-medium ${
                isToday ? "text-neon-cyan" : "text-muted-foreground"
              }`}
            >
              <div className="uppercase">{DAY_NAMES[day.getDay()]}</div>
              <div
                className={`mx-auto mt-0.5 flex size-7 items-center justify-center rounded-full text-sm font-bold ${
                  isToday
                    ? "bg-gradient-to-br from-neon-cyan to-neon-pink text-white"
                    : ""
                }`}
              >
                {day.getDate()}
              </div>
            </div>

            <div className="space-y-1.5">
              {dayPosts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`}>
                  <Card
                    className={`border-l-2 ${STATUS_BORDER[post.status]} p-2 transition-colors hover:bg-muted/50 cursor-pointer`}
                  >
                    <p className="line-clamp-2 text-[11px] font-medium leading-tight">
                      {post.title}
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1 py-0 ${PILAR_COLORS[post.pilar]}`}
                      >
                        {PILAR_LABELS[post.pilar]}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground">
                        {post.scheduled_time}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function fmt(d: Date): string {
  return d.toISOString().split("T")[0];
}
