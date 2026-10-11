"use client";

import { format } from "date-fns";
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    <div className="relative w-full overflow-hidden rounded-2xl">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--primary)/0.15), hsl(220 80% 60% / 0.12), hsl(280 60% 50% / 0.10), hsl(var(--primary)/0.08))",
          backgroundSize: "300% 300%",
          animation: "gradient-pan 10s ease infinite",
        }}
      />
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 32px,currentColor 32px,currentColor 33px),repeating-linear-gradient(90deg,transparent,transparent 32px,currentColor 32px,currentColor 33px)",
        }}
      />

      <div className="relative px-6 py-10 sm:px-10 sm:py-14">
        <div className="reveal-up flex flex-col gap-3 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Monthly Report
          </p>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            {report.monthLabel}
          </h1>

          {/* Big total. On narrow screens the comparison chip sits on its own
              row so it cannot shrink and get clipped by the card. */}
          <div className="mt-2 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
            <div className="min-w-0 max-w-full">
              <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
              <p className="text-4xl font-black tabular-nums tracking-tight min-[420px]:text-5xl sm:text-6xl">
                <CountUp end={report.summary.totalSpent} duration={1200} />
              </p>
            </div>

            {comparison && comparison.trend !== "flat" && (
              <div
                className={cn(
                  "inline-flex w-max max-w-full shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold sm:mb-2",
                  isUp
                    ? "bg-red-500/15 text-red-500"
                    : "bg-green-500/15 text-green-500"
                )}
              >
                {isUp ? (
                  <TrendingUp className="h-4 w-4 shrink-0" />
                ) : (
                  <TrendingDown className="h-4 w-4 shrink-0" />
                )}
                {deltaAbs.toFixed(1)}% vs last month
              </div>
            )}
            {comparison?.trend === "flat" && (
              <div className="inline-flex w-max max-w-full shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-muted px-3 py-1.5 text-sm font-semibold text-muted-foreground sm:mb-2">
                <Minus className="h-4 w-4 shrink-0" />
                Similar to last month
              </div>
            )}
          </div>

          {/* Sub-stats row */}
          <div className="flex flex-wrap gap-4 mt-1 text-sm">
            <div>
              <span className="text-muted-foreground">Transactions </span>
              <span className="font-semibold">{report.summary.transactionCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg / day </span>
              <CountUp end={report.summary.avgDaily} duration={1000} />
            </div>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {format(report.generatedAt, "MMM dd, yyyy 'at' h:mm a")}
            </Badge>
            {report.aiCategorizedCount > 0 && (
              <Badge className="text-xs gap-1 bg-primary/15 text-primary border-primary/20 hover:bg-primary/20">
                <Sparkles className="h-3 w-3" />
                {report.aiCategorizedCount} AI-categorized
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
