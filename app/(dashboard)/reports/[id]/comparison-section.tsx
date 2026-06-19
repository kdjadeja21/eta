"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, GitCompare } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { useFormattedCurrency } from "@/lib/currency-utils";
import type { MoMComparison, Trend } from "@/lib/report-insights";
import type { Report } from "@/lib/report-service";
import { cn } from "@/lib/utils";

interface ComparisonSectionProps {
  comparison: MoMComparison;
  currentReport: Report;
  previousReport: Report;
}

function TrendIcon({ trend, className }: { trend: Trend; className?: string }) {
  if (trend === "up") return <TrendingUp className={cn("h-4 w-4 text-red-500", className)} />;
  if (trend === "down") return <TrendingDown className={cn("h-4 w-4 text-green-500", className)} />;
  return <Minus className={cn("h-4 w-4 text-muted-foreground", className)} />;
}

function deltaColor(trend: Trend, inverted = false): string {
  if (trend === "flat") return "text-muted-foreground";
  const isGood = inverted ? trend === "up" : trend === "down";
  return isGood ? "text-green-500" : "text-red-500";
}

export function ComparisonSection({
  comparison,
  currentReport,
  previousReport,
}: ComparisonSectionProps) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const formatCurrency = useFormattedCurrency();

  const absTotal = Math.abs(comparison.totalDelta);
  const absTotalPct = Math.abs(comparison.totalDeltaPct);

  return (
    <Card ref={ref} className={cn("transition-all duration-500", inView ? "reveal-up" : "opacity-0")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-muted-foreground" />
          vs {previousReport.monthLabel}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Month-over-month comparison
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Total delta */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Spend Change</p>
            <div className="flex items-center gap-2">
              <TrendIcon trend={comparison.trend} className="h-5 w-5" />
              <span className={cn("text-2xl font-black", deltaColor(comparison.trend))}>
                {comparison.trend === "flat" ? "—" : (comparison.trend === "up" ? "+" : "−")}{absTotalPct.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {comparison.trend === "up" ? "+" : comparison.trend === "down" ? "−" : ""}
              {comparison.trend !== "flat" && formatCurrency(absTotal)} {comparison.trend === "up" ? "more" : comparison.trend === "down" ? "less" : "similar"} than {previousReport.monthLabel}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{previousReport.monthLabel}</p>
            <p className="font-semibold">{formatCurrency(previousReport.summary.totalSpent)}</p>
            <p className="text-xs text-muted-foreground mt-1">{currentReport.monthLabel}</p>
            <p className="font-bold">{formatCurrency(currentReport.summary.totalSpent)}</p>
          </div>
        </div>

        {/* Needs/Wants shift */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border space-y-1">
            <p className="text-xs text-muted-foreground">Needs %</p>
            <div className="flex items-center gap-1.5">
              <TrendIcon
                trend={comparison.needsDeltaPct > 1 ? "up" : comparison.needsDeltaPct < -1 ? "down" : "flat"}
                className="h-4 w-4"
              />
              <span className={cn("font-bold", comparison.needsDeltaPct > 1 ? "text-green-500" : comparison.needsDeltaPct < -1 ? "text-red-500" : "text-muted-foreground")}>
                {comparison.needsDeltaPct > 0 ? "+" : ""}{comparison.needsDeltaPct.toFixed(1)}pp
              </span>
            </div>
            <p className="text-xs text-muted-foreground">vs prev month</p>
          </div>
          <div className="p-3 rounded-xl border space-y-1">
            <p className="text-xs text-muted-foreground">Wants %</p>
            <div className="flex items-center gap-1.5">
              <TrendIcon
                trend={comparison.wantsDeltaPct > 1 ? "up" : comparison.wantsDeltaPct < -1 ? "down" : "flat"}
                className="h-4 w-4"
              />
              <span className={cn("font-bold", comparison.wantsDeltaPct > 1 ? "text-red-500" : comparison.wantsDeltaPct < -1 ? "text-green-500" : "text-muted-foreground")}>
                {comparison.wantsDeltaPct > 0 ? "+" : ""}{comparison.wantsDeltaPct.toFixed(1)}pp
              </span>
            </div>
            <p className="text-xs text-muted-foreground">vs prev month</p>
          </div>
        </div>

        {/* Category trends */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Category Trends
          </p>
          {comparison.categoryTrends.map((ct) => (
            <div
              key={ct.category}
              className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <TrendIcon trend={ct.trend} />
                <span className="font-medium truncate">{ct.category}</span>
                {ct.trend === "new" && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary shrink-0">
                    NEW
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-muted-foreground text-xs">
                  {ct.previousAmount > 0 ? formatCurrency(ct.previousAmount) : "—"}
                </span>
                <span className="font-semibold">{formatCurrency(ct.currentAmount)}</span>
                {ct.trend !== "flat" && ct.trend !== "new" && (
                  <span className={cn("text-xs font-semibold w-14 text-right", deltaColor(ct.trend))}>
                    {ct.deltaPct > 0 ? "+" : ""}{ct.deltaPct.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
