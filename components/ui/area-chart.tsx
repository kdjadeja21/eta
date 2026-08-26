"use client";

import React from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { useFormattedCurrency } from "@/lib/currency-utils";
import { CHART_ACCENT, CHART_INK } from "@/lib/chart-colors";

interface AreaChartProps {
  data: { name: string; value: number }[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
  formatCurrency,
}: TooltipProps<number, string> & { formatCurrency: (amount: number) => string }) => {
  if (active && payload && payload.length) {
    const value =
      typeof payload[0].value === "number"
        ? formatCurrency(payload[0].value)
        : payload[0].value;

    return (
      <div className="rounded-md border border-border bg-card px-3 py-2 shadow-sm">
        <p className="text-ui font-medium text-foreground">{label}</p>
        <p className="text-money-sm text-foreground">{value}</p>
      </div>
    );
  }
  return null;
};

const AreaChart: React.FC<AreaChartProps> = ({ data }) => {
  const formatCurrency = useFormattedCurrency();

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_INK[20]} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "var(--ink-3)", fontSize: 11 }}
            axisLine={{ stroke: CHART_INK[20] }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--ink-3)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => formatCurrency(Number(value))}
            width={72}
          />
          <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_ACCENT}
            fill={CHART_INK[20]}
            strokeWidth={2}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChart;
