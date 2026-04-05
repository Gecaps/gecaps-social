import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/lib/types";
import { PILAR_COLORS } from "@/lib/types";

interface MonthViewProps {
  posts: Post[];
  currentDate: Date;
}

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const STATUS_DOT: Record<string, string> = {
  pending: "bg-status-pending",
  approved: "bg-status-approved",
  rejected: "bg-status-rejected",
  published: "bg-status-published",
};

export function MonthView({ posts, currentDate }: MonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date().toISOString().split("T")[0];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="grid grid-cols-7 gap-px">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="pb-2 text-center text-xs font-medium text-muted-foreground"
          >
            {name}
          </div>
        ))}

        {cells.map((day, i) => {
          if (!day) {
            return (
              <div
                key={`empty-${i}`}
                className="min-h-[80px] rounded-lg border border-border/30 bg-muted/20 p-1"
              />
            );
          }

          const dateStr = fmt(day);
          const dayPosts = posts.filter((p) => p.scheduled_date === dateStr);
          const isToday = dateStr === today;

          return (
            <div
              key={dateStr}
              className={`min-h-[80px] rounded-lg border p-1.5 ${
                isToday
                  ? "border-neon-cyan/40 bg-neon-cyan/5"
                  : "border-border/50"
              }`}
            >
              <div
                className={`mb-1 text-xs font-medium ${
                  isToday ? "text-neon-cyan" : "text-muted-foreground"
                }`}
              >
                {day.getDate()}
              </div>

              <div className="space-y-0.5">
                {dayPosts.map((post) => (
                  <Link key={post.id} href={`/post/${post.id}`}>
                    <div className="flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:bg-muted/50 cursor-pointer">
                      <div
                        className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[post.status]}`}
                      />
                      <span className="truncate text-[10px] font-medium">
                        {post.title}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
