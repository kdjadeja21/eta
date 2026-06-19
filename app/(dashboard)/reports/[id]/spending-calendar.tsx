"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { useFormattedCurrency } from "@/lib/currency-utils";
import type { DayCell } from "@/lib/report-insights";
import { cn } from "@/lib/utils";

interface SpendingCalendarProps {
  cells: DayCell[];
  monthLabel: string;
}

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function heatIntensity(amount: number, maxAmount: number): number {
  if (maxAmount === 0 || amount === 0) return 0;
  return Math.min(amount / maxAmount, 1);
}

function intensityClass(level: number): string {
  if (level === 0) return "bg-muted/40";
  if (level < 0.2) return "bg-primary/15";
  if (level < 0.4) return "bg-primary/30";
  if (level < 0.6) return "bg-primary/50";
  if (level < 0.8) return "bg-primary/70";
  return "bg-primary/90";
}

export function SpendingCalendar({ cells, monthLabel }: SpendingCalendarProps) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [hovered, setHovered] = useState<DayCell | null>(null);
  const formatCurrency = useFormattedCurrency();

  const activeCells = cells.filter((c) => !c.isPadding);
  const maxAmount = Math.max(...activeCells.map((c) => c.amount), 0);
  const peakCell = activeCells.reduce(
    (a, b) => (b.amount > a.amount ? b : a),
    activeCells[0] ?? { amount: 0 }
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          Spending Calendar
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Cell intensity = daily spend. Hover for details.
        </p>
      </CardHeader>
      <CardContent ref={ref}>
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => {
            if (cell.isPadding) {
              return <div key={`pad-${idx}`} className="aspect-square" />;
            }

            const intensity = heatIntensity(cell.amount, maxAmount);
            const isPeak = cell.date === peakCell?.date && cell.amount > 0;

            return (
              <div
                key={cell.date}
                onMouseEnter={() => setHovered(cell)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "relative aspect-square rounded-md flex items-center justify-center cursor-default",
                  "transition-all duration-200",
                  inView
                    ? cn(intensityClass(intensity), "scale-100 opacity-100")
                    : "opacity-0 scale-90",
                  isPeak && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                  hovered?.date === cell.date && "scale-110 z-10",
                  cell.isToday && !isPeak && "ring-1 ring-muted-foreground/40"
                )}
                style={{
                  transitionDelay: inView ? `${Math.min(idx * 8, 200)}ms` : "0ms",
                }}
                title={cell.amount > 0 ? `${cell.date}: ${formatCurrency(cell.amount)}` : cell.date}
              >
                <span
                  className={cn(
                    "text-[10px] font-medium leading-none",
                    intensity > 0.5 ? "text-primary-foreground" : "text-foreground/70"
                  )}
                >
                  {cell.dayNum}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hover tooltip */}
        <div
          className={cn(
            "mt-3 px-3 py-2 rounded-lg bg-muted/60 text-sm transition-all duration-200",
            hovered && !hovered.isPadding ? "opacity-100" : "opacity-0"
          )}
        >
          {hovered && !hovered.isPadding && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {new Date(hovered.date + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className={cn("font-bold", hovered.amount > 0 ? "text-foreground" : "text-muted-foreground")}>
                {hovered.amount > 0 ? formatCurrency(hovered.amount) : "No spend"}
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Less</span>
          {[0, 0.15, 0.35, 0.55, 0.75, 1].map((lvl) => (
            <div key={lvl} className={cn("w-4 h-3 rounded-sm", intensityClass(lvl))} />
          ))}
          <span className="text-[10px] text-muted-foreground">More</span>
        </div>
      </CardContent>
    </Card>
  );
}
