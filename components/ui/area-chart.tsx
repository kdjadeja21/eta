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

interface AreaChartProps {
  data: { name: string; value: number }[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
  formatCurrency,
}: TooltipProps<number, string> & {
  formatCurrency: (amount: number) => string;
}) => {
  if (active && payload && payload.length) {
    const value =
      typeof payload[0].value === "number"
        ? formatCurrency(payload[0].value)
        : payload[0].value;

    return (
      <div className="rounded-lg border border-border bg-popover p-3 shadow-sm">
        <p className="text-sm font-medium text-popover-foreground">{label}</p>
        <p className="font-money text-sm text-primary">{value}</p>
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
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="name"
            stroke="var(--muted-foreground)"
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(Number(value))}
          />
          <Tooltip
            content={<CustomTooltip formatCurrency={formatCurrency} />}
          />
          <Area
            type="monotone"
            dataKey="value"
            name="Spent"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="var(--chart-1)"
            fillOpacity={0.18}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChart;
