"use client";

import { useMemo, useState } from "react";
import { Calendar, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/calendar/calendar-view";
import type { Piece } from "@/modules/pieces/types";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  type PieceStatus,
} from "@/modules/accounts/types";

interface CalendarioPageClientProps {
  accountId: string;
  pieces: Piece[];
}

const CALENDAR_STATUSES: PieceStatus[] = [
  "in_production",
  "final_approved",
  "scheduled",
  "published",
  "in_adjustment",
];

export function CalendarioPageClient({
  accountId,
  pieces,
}: CalendarioPageClientProps) {
  const [statusFilter, setStatusFilter] = useState<PieceStatus | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const scheduledPieces = useMemo(
    () => pieces.filter((p) => p.scheduled_date !== null),
    [pieces]
  );

  const filteredPieces = useMemo(
    () =>
      statusFilter
        ? scheduledPieces.filter((p) => p.status === statusFilter)
        : scheduledPieces,
    [scheduledPieces, statusFilter]
  );

  const scheduledCount = scheduledPieces.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-muted-foreground" />
            <h1 className="text-2xl font-heading font-extrabold tracking-tight">
              Calendario
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Calendario editorial &middot; {scheduledCount} peca
            {scheduledCount !== 1 ? "s" : ""} agendada
            {scheduledCount !== 1 ? "s" : ""}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "border-primary text-primary" : ""}
        >
          <Filter className="mr-1.5 size-3.5" />
          Filtros
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge
            variant={statusFilter === null ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => setStatusFilter(null)}
          >
            Todos
          </Badge>
          {CALENDAR_STATUSES.map((status) => {
            const count = scheduledPieces.filter(
              (p) => p.status === status
            ).length;
            return (
              <Badge
                key={status}
                variant="outline"
                className={`cursor-pointer text-xs ${
                  statusFilter === status
                    ? STATUS_COLORS[status]
                    : "text-muted-foreground"
                }`}
                onClick={() =>
                  setStatusFilter(statusFilter === status ? null : status)
                }
              >
                {STATUS_LABELS[status]} ({count})
              </Badge>
            );
          })}
        </div>
      )}

      {/* Calendar */}
      <CalendarView accountId={accountId} pieces={filteredPieces} />
    </div>
  );
}
