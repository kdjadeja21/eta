"use client";

import { format } from "date-fns";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import CountUp from "@/components/count-up";
import type { Report } from "@/lib/report-service";
import type { MoMComparison } from "@/lib/report-insights";
import { cn } from "@/lib/utils";

interface ReportHeroProps {
  report: Report;
  comparison: MoMComparison | null;
}

export function ReportHero({ report, comparison }: ReportHeroProps) {
  const deltaAbs = comparison ? Math.abs(comparison.totalDeltaPct) : 0;
  const isUp = comparison?.trend === "up";

  return (
    <header className="rounded-2xl border border-border bg-card px-6 py-10 sm:px-10 sm:py-12">
      <div className="reveal-up flex max-w-2xl flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Monthly Statement
        </p>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {report.monthLabel}
        </h1>

        {/* Big total */}
        <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-2">
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Total Spent
            </p>
            <p className="font-money text-5xl font-semibold leading-none sm:text-6xl">
              <CountUp end={report.summary.totalSpent} duration={1200} />
            </p>
          </div>

          {comparison && comparison.trend !== "flat" && (
            <div
              className={cn(
                "mb-1 flex items-center gap-1.5 text-sm font-medium",
                isUp ? "text-destructive" : "text-primary",
              )}
            >
              {isUp ? (
                <TrendingUp className="h-4 w-4" aria-hidden />
              ) : (
                <TrendingDown className="h-4 w-4" aria-hidden />
              )}
              <span className="font-money">{deltaAbs.toFixed(1)}%</span>
              vs last month
            </div>
          )}
          {comparison?.trend === "flat" && (
            <div className="mb-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Minus className="h-4 w-4" aria-hidden />
              Similar to last month
            </div>
          )}
        </div>

        {/* Sub-stats row */}
        <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <div>
            <span className="text-muted-foreground">Transactions </span>
            <span className="font-money font-semibold">
              {report.summary.transactionCount}
            </span>
          </div>
          <div className="font-money font-semibold">
            <span className="font-sans font-normal text-muted-foreground">
              Avg / day{" "}
            </span>
            <CountUp end={report.summary.avgDaily} duration={1000} />
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Generated {format(report.generatedAt, "MMM dd, yyyy 'at' h:mm a")}
          {report.aiCategorizedCount > 0 &&
            ` · ${report.aiCategorizedCount} expense${
              report.aiCategorizedCount === 1 ? "" : "s"
            } auto-categorized`}
        </p>
      </div>
    </header>
  );
}
