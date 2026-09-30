"use client";

import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useFormattedCurrency } from "@/lib/currency-utils";
import type { Expense } from "@/lib/expense-service";
import { cn } from "@/lib/utils";
import { summarizeDay } from "./summarize-day";

interface DailyDesktopMetricsProps {
  expenses: Expense[];
  totalSpent: number;
  trendPercent: number | null;
  isLoading: boolean;
}

export function DailyDesktopMetrics({
  expenses,
  totalSpent,
  trendPercent,
  isLoading,
}: DailyDesktopMetricsProps) {
  const formatCurrency = useFormattedCurrency();
  const { topCategory, transactionCount } = summarizeDay(expenses);
  const trendUp = trendPercent !== null && trendPercent >= 0;

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <MetricCard label="Total spent">
        {isLoading ? (
          <MetricSkeleton />
        ) : (
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {formatCurrency(totalSpent)}
          </p>
        )}
      </MetricCard>

      <MetricCard label="Vs yesterday">
        {isLoading ? (
          <MetricSkeleton />
        ) : trendPercent === null ? (
          <p className="text-2xl font-semibold tracking-tight text-muted-foreground">
            —
          </p>
        ) : (
          <p
            className={cn(
              "flex items-center gap-1.5 text-2xl font-semibold tracking-tight tabular-nums",
              trendUp ? "text-foreground" : "text-emerald-700 dark:text-emerald-400",
            )}
          >
            {trendUp ? (
              <TrendingUp className="size-5 text-muted-foreground" />
            ) : (
              <TrendingDown className="size-5" />
            )}
            {trendUp ? "+" : ""}
            {trendPercent}%
          </p>
        )}
      </MetricCard>

      <MetricCard label="Transactions">
        {isLoading ? (
          <MetricSkeleton />
        ) : (
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {transactionCount}
          </p>
        )}
      </MetricCard>

      <MetricCard label="Top category">
        {isLoading ? (
          <MetricSkeleton />
        ) : topCategory ? (
          <div className="min-w-0">
            <p className="truncate text-2xl font-semibold tracking-tight">
              {topCategory.category}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
              {formatCurrency(topCategory.amount)}
            </p>
          </div>
        ) : (
          <p className="text-2xl font-semibold tracking-tight text-muted-foreground">
            —
          </p>
        )}
      </MetricCard>
    </section>
  );
}

function MetricCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-xl border bg-card px-4 py-4 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </article>
  );
}

function MetricSkeleton() {
  return <div className="h-8 w-28 animate-pulse rounded-md bg-muted" />;
}
