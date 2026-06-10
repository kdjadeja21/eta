"use client";

import React from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
}: TooltipProps<number, string> & { formatCurrency: (amount: number) => string }) => {
  if (active && payload && payload.length) {
    const value =
      typeof payload[0].value === "number"
        ? formatCurrency(payload[0].value)
        : payload[0].value;

    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
        <p className="text-gray-200 font-medium">{label}</p>
        <p className="text-gray-300">
          Value: <span className="text-purple-400">{value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const AreaChart: React.FC<AreaChartProps> = ({ data }) => {
  const formatCurrency = useFormattedCurrency();

  return (
    <div className="w-full h-64">
      {" "}
      {/* Set a fixed height for visibility */}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-700" />
          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis
            stroke="#9ca3af"
            tickFormatter={(value) => formatCurrency(Number(value))}
          />
          <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.3}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChart;
