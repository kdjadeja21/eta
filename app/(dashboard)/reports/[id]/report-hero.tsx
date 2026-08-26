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
  const isDown = comparison?.trend === "down";

  return (
    <header className="border-b border-border pb-8 pt-2">
      <p className="text-meta uppercase tracking-wide">Monthly statement</p>
      <h1 className="text-title mt-2">{report.monthLabel}</h1>

      <div className="mt-6 flex flex-wrap items-end gap-6">
        <div>
          <p className="text-meta">Total spent</p>
          <p className="text-money-lg mt-1 text-foreground">
            <CountUp end={report.summary.totalSpent} duration={800} />
          </p>
        </div>

        {comparison && comparison.trend !== "flat" && (
          <p
            className={cn(
              "text-ui pb-1",
              isUp ? "text-[var(--warn)]" : "text-[var(--good)]"
            )}
          >
            {isUp ? (
              <TrendingUp className="mr-1 inline size-4" />
            ) : (
              <TrendingDown className="mr-1 inline size-4" />
            )}
            {deltaAbs.toFixed(1)}% vs prior month
          </p>
        )}
        {comparison?.trend === "flat" && (
          <p className="flex items-center gap-1 text-ui text-muted-foreground pb-1">
            <Minus className="size-4" />
            Similar to prior month
          </p>
        )}
      </div>

      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-ui">
        <div>
          <dt className="text-meta inline">Transactions </dt>
          <dd className="inline font-medium">{report.summary.transactionCount}</dd>
        </div>
        <div>
          <dt className="text-meta inline">Avg / day </dt>
          <dd className="inline font-medium">
            <CountUp end={report.summary.avgDaily} duration={700} />
          </dd>
        </div>
        <div>
          <dt className="text-meta inline">Generated </dt>
          <dd className="inline font-medium">
            {format(report.generatedAt, "MMM d, yyyy")}
          </dd>
        </div>
      </dl>
    </header>
  );
}
