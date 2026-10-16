"use client";

import { useFormattedCurrency } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";

interface WeeklyFastDayMessageProps {
  count: number;
  isLoading: boolean;
  className?: string;
}

export function WeeklyFastDayMessage({
  count,
  isLoading,
  className,
}: WeeklyFastDayMessageProps) {
  const formatCurrency = useFormattedCurrency();

  if (isLoading) {
    return (
      <p
        className={cn(
          "text-center text-xs text-muted-foreground sm:text-sm",
          className,
        )}
      >
        Checking this week…
      </p>
    );
  }

  const goalMet = count >= 1;
  const dayLabel = count === 1 ? "day" : "days";

  return (
    <p
      className={cn(
        "rounded-xl border px-3 py-2.5 text-center text-xs font-medium leading-snug sm:text-sm",
        goalMet
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400"
          : "border-amber-500/25 bg-amber-500/10 text-amber-900 dark:text-amber-400",
        className,
      )}
    >
      {goalMet ? (
        <>
          Great job! You&apos;ve already fasted for{" "}
          <span className="font-semibold tabular-nums">{count}</span> {dayLabel}{" "}
          this week.
        </>
      ) : (
        <>
          Fast at least one day this week — no completed days at{" "}
          <span className="font-semibold tabular-nums">{formatCurrency(0)}</span>{" "}
          yet.
        </>
      )}
    </p>
  );
}
