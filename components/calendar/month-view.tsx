import Link from "next/link";
import type { Piece } from "@/modules/pieces/types";
import { PILAR_COLORS, type PiecePilar } from "@/modules/accounts/types";

interface MonthViewProps {
  accountId: string;
  pieces: Piece[];
  currentDate: Date;
  onCreatePost: (date: string) => void;
}

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const STATUS_DOT: Record<string, string> = {
  reference: "bg-gray-400",
  idea: "bg-purple-400",
  idea_approved: "bg-violet-400",
  in_production: "bg-amber-400",
  final_approved: "bg-emerald-400",
  scheduled: "bg-blue-400",
  published: "bg-indigo-400",
  rejected: "bg-red-400",
  in_adjustment: "bg-orange-400",
  paused: "bg-gray-400",
};

export function MonthView({ accountId, pieces, currentDate, onCreatePost }: MonthViewProps) {
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
        {DAY_NAMES.map((name, idx) => (
          <div
            key={name}
            className={`pb-2 text-center text-xs font-medium ${
              idx === 0 || idx === 6
                ? "text-muted-foreground/50"
                : "text-muted-foreground"
            }`}
          >
            {name}
          </div>
        ))}

        {cells.map((day, i) => {
          if (!day) {
            return (
              <div
                key={`empty-${i}`}
                className="min-h-[80px] rounded-lg border border-dashed border-border/20 bg-muted/10 p-1"
              />
            );
          }

          const dateStr = fmt(day);
          const dayPieces = pieces.filter((p) => p.scheduled_date === dateStr);
          const isToday = dateStr === today;
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <div
              key={dateStr}
              className={`min-h-[80px] rounded-lg border p-1.5 ${
                isToday
                  ? "border-neon-cyan/40 bg-neon-cyan/5"
                  : isWeekend
                    ? "border-border/30 bg-muted/10"
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
                {dayPieces.map((piece) => (
                  <Link key={piece.id} href={`/${accountId}/pecas/${piece.id}`}>
                    <div className="flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:bg-muted/50 cursor-pointer">
                      <div
                        className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[piece.status]}`}
                      />
                      {piece.pilar && (
                        <div
                          className={`size-1.5 shrink-0 rounded-full ${
                            PILAR_COLORS[piece.pilar]?.split(" ")[0] ?? ""
                          }`}
                        />
                      )}
                      <span className="truncate text-[10px] font-medium">
                        {piece.title}
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
