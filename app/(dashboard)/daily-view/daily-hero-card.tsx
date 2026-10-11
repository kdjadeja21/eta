"use client";

import {
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import CountUp from "@/components/count-up";

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
  const isExpenseFastDay = !isLoading && totalSpent === 0;

  const dayLabel = isToday(selectedDate)
    ? "TODAY"
    : format(selectedDate, "EEEE").toUpperCase();

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl py-5 pl-3 pr-3 sm:rounded-3xl sm:py-6 sm:pl-4 sm:pr-4",
        isExpenseFastDay
          ? "bg-gradient-to-br from-primary via-emerald-600 to-teal-600 shadow-[0_16px_48px_-10px_rgba(16,185,129,0.42)] dark:from-slate-900 dark:via-emerald-950 dark:to-teal-950 dark:shadow-[0_20px_56px_-14px_rgba(6,78,59,0.6)]"
          : "bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-500 shadow-[0_16px_48px_-10px_rgba(99,102,241,0.45)] dark:bg-gradient-to-br dark:from-slate-900 dark:via-indigo-950 dark:to-violet-950 dark:shadow-[0_20px_56px_-14px_rgba(30,27,75,0.65)]",
        "dark:ring-1 dark:ring-white/[0.07]"
      )}
    >
      <div className="flex items-center">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous day"
          className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-all active:scale-95 sm:h-9 sm:w-9"
        >
          <ChevronLeft className="h-4 w-4 translate-x-px sm:h-[18px] sm:w-[18px]" />
        </button>

        <div className="min-w-0 flex-1 px-2">
          <div className="text-center">
            <p className="text-[10px] font-semibold tracking-[0.2em] text-white/75 sm:text-[11px]">
              {dayLabel}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-white sm:text-base">
              {format(selectedDate, "MMMM d, yyyy")}
            </p>
            {!isToday(selectedDate) && (
              <button
                type="button"
                onClick={onGoToToday}
                className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-semibold text-white/90 transition-all hover:bg-white/30 active:scale-95"
              >
                Back to Today
              </button>
            )}
          </div>

          <div className="mt-5 text-center sm:mt-6">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-white/70 sm:text-[11px]">
              TOTAL SPENT
            </p>
            {isLoading ? (
              <div className="mx-auto mt-2.5 h-10 w-36 animate-pulse rounded-xl bg-white/15 sm:h-12 sm:w-44" />
            ) : (
              <p className="mt-1.5 text-[36px] font-bold leading-none tracking-tight text-white sm:text-[42px]">
                <CountUp end={totalSpent} duration={600} />
              </p>
            )}

            {!isLoading && trendPercent !== null && (
              <div className="mx-auto mt-3.5 inline-flex max-w-full items-center justify-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium text-white/95 sm:px-3 sm:text-[11px]">
                {trendPercent >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {trendPercent >= 0 ? "+" : ""}
                  {trendPercent}% from yesterday
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          aria-label="Next day"
          className={cn(
            "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-all active:scale-95 sm:h-9 sm:w-9",
            !canGoNext && "cursor-not-allowed opacity-35"
          )}
        >
          <ChevronRight className="h-4 w-4 -translate-x-px sm:h-[18px] sm:w-[18px]" />
        </button>
      </div>
    </div>
  );
}
