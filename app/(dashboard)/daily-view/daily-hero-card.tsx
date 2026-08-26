"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { useFormattedCurrency } from "@/lib/currency-utils";

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
  const isNoSpendDay = !isLoading && totalSpent === 0;

  const dayLabel = isToday(selectedDate)
    ? "Today"
    : format(selectedDate, "EEEE");

  return (
    <section className="rounded-2xl border border-border bg-card px-4 py-6 sm:px-6 sm:py-8">
      {/* Date navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous day"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:bg-accent"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {dayLabel}
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-foreground sm:text-base">
            {format(selectedDate, "MMMM d, yyyy")}
          </p>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          aria-label="Next day"
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:bg-accent",
            !canGoNext &&
              "cursor-not-allowed opacity-35 hover:bg-transparent hover:text-muted-foreground",
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day total */}
      <div className="mt-7 text-center sm:mt-8">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Total spent
        </p>
        {isLoading ? (
          <div className="mx-auto mt-3 h-12 w-44 animate-pulse rounded-lg bg-muted sm:h-14 sm:w-56" />
        ) : (
          <p className="font-money mt-2 text-5xl font-semibold leading-none text-foreground sm:text-6xl">
            {formatCurrency(totalSpent)}
          </p>
        )}

        <div className="mt-4 flex min-h-7 flex-wrap items-center justify-center gap-2">
          {!isLoading && isNoSpendDay && (
            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
              No-spend day
            </span>
          )}
          {!isLoading && trendPercent !== null && (
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              {trendPercent >= 0 ? (
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              ) : (
                <ArrowDownRight className="h-4 w-4" aria-hidden />
              )}
              <span className="font-money text-[13px]">
                {trendPercent >= 0 ? "+" : ""}
                {trendPercent}%
              </span>
              vs yesterday
            </span>
          )}
          {!isToday(selectedDate) && (
            <button
              type="button"
              onClick={onGoToToday}
              className="inline-flex min-h-7 items-center rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
            >
              Back to today
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
