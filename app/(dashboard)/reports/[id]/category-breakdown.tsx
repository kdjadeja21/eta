"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart as PieIcon } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useInView } from "@/hooks/use-in-view";
import { useFormattedCurrency } from "@/lib/currency-utils";
import type { CategoryBreakdown } from "@/lib/report-service";
import { cn } from "@/lib/utils";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8",
  "#82CA9D", "#FFC658", "#FF6B6B", "#4ECDC4", "#45B7D1",
];

interface CategoryBreakdownProps {
  categories: CategoryBreakdown[];
  totalSpent: number;
}

type ViewMode = "donut" | "bar";
type Metric = "amount" | "pct";

export function CategoryBreakdownChart({ categories, totalSpent }: CategoryBreakdownProps) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [viewMode, setViewMode] = useState<ViewMode>("donut");
  const [metric, setMetric] = useState<Metric>("amount");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const formatCurrency = useFormattedCurrency();

  const top10 = categories.slice(0, 10);

  const chartData = top10.map((c, i) => ({
    name: c.category,
    value: metric === "amount" ? c.amount : c.percentage,
    rawAmount: c.amount,
    pct: c.percentage,
    color: COLORS[i % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg p-2.5 shadow text-xs space-y-1">
        <p className="font-semibold text-sm">{d.name}</p>
        <p>{formatCurrency(d.rawAmount)}</p>
        <p className="text-muted-foreground">{d.pct.toFixed(1)}% of total</p>
      </div>
    );
  };

  return (
    <Card ref={ref}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Spending by Category
          </CardTitle>
          <div className="flex items-center gap-1">
            {/* Metric toggle */}
            <div className="flex rounded-md border overflow-hidden text-xs">
              <button
                onClick={() => setMetric("amount")}
                className={cn(
                  "px-2 py-1 cursor-pointer transition-colors",
                  metric === "amount" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                ₹
              </button>
              <button
                onClick={() => setMetric("pct")}
                className={cn(
                  "px-2 py-1 cursor-pointer transition-colors",
                  metric === "pct" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                %
              </button>
            </div>
            {/* View toggle */}
            <div className="flex rounded-md border overflow-hidden">
              <button
                onClick={() => setViewMode("donut")}
                className={cn(
                  "p-1 cursor-pointer transition-colors",
                  viewMode === "donut" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                <PieIcon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("bar")}
                className={cn(
                  "p-1 cursor-pointer transition-colors",
                  viewMode === "bar" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                <BarChart3 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "donut" ? (
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="h-64 w-full lg:w-64 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                    isAnimationActive={inView}
                    animationBegin={0}
                    animationDuration={800}
                    onMouseEnter={(_, i) => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {chartData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        opacity={activeIndex === null || activeIndex === i ? 1 : 0.55}
                        strokeWidth={activeIndex === i ? 2 : 0}
                        stroke={activeIndex === i ? entry.color : "transparent"}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex-1 space-y-2 w-full">
              {chartData.map((d, i) => (
                <div
                  key={d.name}
                  className={cn(
                    "flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer transition-all",
                    activeIndex === i ? "bg-muted" : "hover:bg-muted/50"
                  )}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="truncate font-medium">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-right">
                    <span className="text-muted-foreground text-xs">{d.pct.toFixed(1)}%</span>
                    <span className="font-semibold">{formatCurrency(d.rawAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="opacity-20" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) =>
                    metric === "amount" ? formatCurrency(v) : `${v.toFixed(0)}%`
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  width={110}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  radius={[0, 6, 6, 0]}
                  isAnimationActive={inView}
                  animationBegin={0}
                  animationDuration={700}
                  onMouseEnter={(_, i) => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {chartData.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      opacity={activeIndex === null || activeIndex === i ? 1 : 0.6}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
