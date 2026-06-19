"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartPulse } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useInView } from "@/hooks/use-in-view";
import { useFormattedCurrency } from "@/lib/currency-utils";
import type { NeedsWantsVerdict } from "@/lib/report-insights";
import type { TypeBreakdown } from "@/lib/report-service";
import { cn } from "@/lib/utils";

interface NeedsWantsGaugeProps {
  byType: TypeBreakdown;
  verdict: NeedsWantsVerdict;
}

const TYPE_COLORS = {
  need: "#22c55e",
  want: "#3b82f6",
  not_sure: "#f59e0b",
};

const VERDICT_STYLES: Record<NeedsWantsVerdict["tone"], string> = {
  positive: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20",
  neutral: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  warning: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
};

export function NeedsWantsGauge({ byType, verdict }: NeedsWantsGaugeProps) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const formatCurrency = useFormattedCurrency();

  const data = [
    { name: "Needs", value: byType.need, key: "need" },
    { name: "Wants", value: byType.want, key: "want" },
    { name: "Not Sure", value: byType.not_sure, key: "not_sure" },
  ].filter((d) => d.value > 0);

  const total = byType.need + byType.want + byType.not_sure;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0";
      return (
        <div className="bg-background border rounded-lg p-2 shadow text-xs">
          <p className="font-medium">{d.name}</p>
          <p>{formatCurrency(d.value)}</p>
          <p className="text-muted-foreground">{pct}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full" ref={ref}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
            Spending Health
          </span>
          <Badge
            variant="outline"
            className={cn("text-xs font-semibold", VERDICT_STYLES[verdict.tone])}
          >
            {verdict.label}
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">{verdict.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Donut with center label */}
        <div className="relative h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                isAnimationActive={inView}
                animationBegin={0}
                animationDuration={900}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={TYPE_COLORS[entry.key as keyof typeof TYPE_COLORS]}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-2xl font-black">{verdict.needsPct}%</p>
            <p className="text-xs text-muted-foreground">Needs</p>
          </div>
        </div>

        {/* Segmented split bar */}
        <div>
          <div className="flex h-3 rounded-full overflow-hidden gap-px">
            {verdict.needsPct > 0 && (
              <div
                className="transition-all duration-700 ease-out"
                style={{
                  width: inView ? `${verdict.needsPct}%` : "0%",
                  backgroundColor: TYPE_COLORS.need,
                }}
              />
            )}
            {verdict.wantsPct > 0 && (
              <div
                className="transition-all duration-700 ease-out delay-100"
                style={{
                  width: inView ? `${verdict.wantsPct}%` : "0%",
                  backgroundColor: TYPE_COLORS.want,
                }}
              />
            )}
            {verdict.notSurePct > 0 && (
              <div
                className="transition-all duration-700 ease-out delay-200"
                style={{
                  width: inView ? `${verdict.notSurePct}%` : "0%",
                  backgroundColor: TYPE_COLORS.not_sure,
                }}
              />
            )}
          </div>
          <div className="flex gap-4 mt-2 flex-wrap">
            {data.map((d) => (
              <div key={d.key} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      TYPE_COLORS[d.key as keyof typeof TYPE_COLORS],
                  }}
                />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="font-medium">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
