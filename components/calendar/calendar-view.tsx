"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Account } from "@/modules/accounts/types";
import type { Piece } from "@/modules/pieces/types";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";

interface CalendarViewProps {
  posts: Piece[];
  accounts: Account[];
}

export function CalendarView({ posts }: CalendarViewProps) {
  const [view, setView] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [createDate, setCreateDate] = useState<string | null>(null);

  function navigateWeek(dir: number) {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  }

  function navigateMonth(dir: number) {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  }

  const navigate = view === "week" ? navigateWeek : navigateMonth;

  const monthNames = [
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  function getLabel() {
    if (view === "month") {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    const start = getWeekStart(currentDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const s = `${start.getDate()}/${start.getMonth() + 1}`;
    const e = `${end.getDate()}/${end.getMonth() + 1}`;
    return `${s} - ${e}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[160px] text-center text-sm font-semibold">
            {getLabel()}
          </span>
          <Button variant="ghost" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => setCurrentDate(new Date())}
          >
            Hoje
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border">
            <button
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "week"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              } rounded-l-lg`}
              onClick={() => setView("week")}
            >
              Semana
            </button>
            <button
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "month"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              } rounded-r-lg`}
              onClick={() => setView("month")}
            >
              Mes
            </button>
          </div>
        </div>
      </div>

      {view === "week" ? (
        <WeekView
          posts={posts}
          currentDate={currentDate}
          onCreatePost={(date) => setCreateDate(date)}
        />
      ) : (
        <MonthView
          posts={posts}
          currentDate={currentDate}
          onCreatePost={(date) => setCreateDate(date)}
        />
      )}

      {/* TODO: CreatePieceModal will replace this */}
    </div>
  );
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}
