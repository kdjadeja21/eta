"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { useFormattedCurrency } from "@/lib/currency-utils";
import { Button } from "@/components/ui/button";

interface DailyHeroCardProps {
  selectedDate: Date;
  totalSpent: number;
  trendPercent: number | null;
  isLoading: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoToToday: () => void;
}

export function DailyHeroCard({
  selectedDate,
  totalSpent,
  trendPercent,
  isLoading,
  canGoNext,
  onPrev,
  onNext,
  onGoToToday,
}: DailyHeroCardProps) {
  const formatCurrency = useFormattedCurrency();

  const dayLabel = isToday(selectedDate)
    ? "Today"
    : format(selectedDate, "EEEE, MMMM d");

  return (
    <div className="flex flex-col gap-6 md:sticky md:top-8 md:self-start">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11 shrink-0"
          onClick={onPrev}
          aria-label="Previous day"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-meta uppercase tracking-wide">{dayLabel}</p>
          {!isToday(selectedDate) && (
            <button
              type="button"
              onClick={onGoToToday}
              className="mt-1 text-ui text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Jump to today
            </button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11 shrink-0"
          onClick={onNext}
          disabled={!canGoNext}
          aria-label="Next day"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      <div>
        <p className="text-meta">Total spent</p>
        {isLoading ? (
          <div
            className="mt-2 h-16 w-48 max-w-full animate-pulse rounded-md bg-muted"
            aria-label="Loading total"
          />
        ) : (
          <p className="text-money-lg mt-1 text-foreground">{formatCurrency(totalSpent)}</p>
        )}
        {!isLoading && trendPercent !== null && (
          <p
            className={cn(
              "mt-3 text-ui",
              trendPercent >= 0 ? "text-[var(--warn)]" : "text-[var(--good)]"
            )}
          >
            {trendPercent >= 0 ? "+" : ""}
            {trendPercent}% vs yesterday
          </p>
        )}
      </div>
    </div>
  );
}
