import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import type { Post } from "@/lib/types";
import { PILAR_LABELS, PILAR_COLORS } from "@/lib/types";

interface WeekViewProps {
  posts: Post[];
  currentDate: Date;
  onCreatePost: (date: string) => void;
}

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const STATUS_BORDER: Record<string, string> = {
  pending: "border-l-status-pending",
  approved: "border-l-status-approved",
  rejected: "border-l-status-rejected",
  published: "border-l-status-published",
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
              {dayPosts.map((post) => {
                const previewUrl = `/api/preview?title=${encodeURIComponent(post.title)}&hook=${encodeURIComponent(post.hook || "")}&pilar=${post.pilar}&cta=${encodeURIComponent(post.cta || "")}&layout=${post.layout || "branco"}&w=200`;

                return (
                  <Link key={post.id} href={`/post/${post.id}`}>
                    <Card
                      className={`border-l-2 ${STATUS_BORDER[post.status]} overflow-hidden transition-colors hover:bg-muted/50 cursor-pointer`}
                    >
                      {/* Thumbnail */}
                      <img
                        src={previewUrl}
                        alt=""
                        loading="lazy"
                        className="w-full aspect-[4/5] object-cover"
                      />
                      <div className="p-1.5">
                        <p className="line-clamp-1 text-[10px] font-medium leading-tight">
                          {post.title}
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className={`text-[8px] px-1 py-0 ${PILAR_COLORS[post.pilar]}`}
                          >
                            {PILAR_LABELS[post.pilar]}
                          </Badge>
                          <span className="text-[8px] text-muted-foreground">
                            {post.scheduled_time}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}

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
