import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import type { Piece } from "@/modules/pieces/types";
import { PILAR_LABELS, PILAR_COLORS } from "@/modules/accounts/types";

interface WeekViewProps {
  posts: Piece[];
  currentDate: Date;
  onCreatePost: (date: string) => void;
}

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const STATUS_BORDER: Record<string, string> = {
  reference: "border-l-gray-400",
  idea: "border-l-purple-400",
  idea_approved: "border-l-violet-400",
  in_production: "border-l-amber-400",
  final_approved: "border-l-emerald-400",
  scheduled: "border-l-blue-400",
  published: "border-l-indigo-400",
  rejected: "border-l-red-400",
  in_adjustment: "border-l-orange-400",
  paused: "border-l-gray-400",
};

export function WeekView({ posts, currentDate, onCreatePost }: WeekViewProps) {
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
          <div key={dateStr} className="min-h-[240px]">
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

            <div className="space-y-2">
              {dayPosts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`}>
                  <Card className={`border-l-2 ${STATUS_BORDER[post.status]} p-2.5 transition-colors hover:bg-muted/50 cursor-pointer`}>
                    <p className="line-clamp-2 text-[11px] font-semibold leading-tight mb-1.5">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={`text-[8px] px-1 py-0 ${PILAR_COLORS[post.pilar]}`}>
                        {PILAR_LABELS[post.pilar]}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground">{post.scheduled_time}</span>
                    </div>
                  </Card>
                </Link>
              ))}

              {/* Add button on empty days */}
              {dayPosts.length === 0 && (
                <button
                  onClick={() => onCreatePost(dateStr)}
                  className="flex w-full items-center justify-center rounded-lg border border-dashed border-border/50 p-6 text-muted-foreground/40 transition-colors hover:border-primary/30 hover:text-primary/60"
                >
                  <Plus className="size-5" />
                </button>
              )}
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
