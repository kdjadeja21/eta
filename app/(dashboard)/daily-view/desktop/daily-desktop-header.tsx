"use client";

import { format, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyDesktopHeaderProps {
  selectedDate: Date;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoToToday: () => void;
  onAdd: () => void;
}

export function DailyDesktopHeader({
  selectedDate,
  canGoNext,
  onPrev,
  onNext,
  onGoToToday,
  onAdd,
}: DailyDesktopHeaderProps) {
  const viewingToday = isToday(selectedDate);

  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Daily view
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          {format(selectedDate, "EEEE, MMMM d, yyyy")}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-lg border bg-card p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onPrev}
            aria-label="Previous day"
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-16 px-1 text-center text-sm font-medium tabular-nums">
            {format(selectedDate, "MMM d")}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!canGoNext}
            aria-label="Next day"
          >
            <ChevronRight />
          </Button>
        </div>

        {!viewingToday && (
          <Button type="button" variant="outline" onClick={onGoToToday}>
            Today
          </Button>
        )}

        <Button type="button" onClick={onAdd}>
          <Plus />
          Add expense
        </Button>
      </div>
    </header>
  );
}
