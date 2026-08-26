"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormattedCurrency } from "@/lib/currency-utils";
import { useEffect, useState, useMemo } from "react";
import { expenseService } from "@/lib/expense-service";
import { ExpenseType, formatExpenseType } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DateRange } from "react-day-picker";
import { chartInkWithAccent } from "@/lib/chart-colors";

interface ExpensePieChartProps {
  userId: string;
  dateRange: DateRange;
  refreshKey?: number;
}

type FieldType = "paidBy" | "category" | "subcategory" | "tags" | "type";

export function ExpensePieChart({
  userId,
  dateRange,
  refreshKey,
}: ExpensePieChartProps) {
  const formattedAmount = useFormattedCurrency();
  const [selectedField, setSelectedField] = useState<FieldType>("type");
  const [chartData, setChartData] = useState<Array<{ name: string; value: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hiddenSegments, setHiddenSegments] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!dateRange.from || !dateRange.to) return;

        const expenses = await expenseService.getExpenses(
          userId,
          dateRange.from,
          dateRange.to
        );

        const aggregatedData = expenses.reduce((acc, expense) => {
          if (selectedField === "tags") {
            expense.tags?.forEach((tag) => {
              acc[tag] = (acc[tag] || 0) + expense.amount;
            });
          } else {
            const value = expense[selectedField];
            if (value) {
              acc[value] = (acc[value] || 0) + expense.amount;
            }
          }
          return acc;
        }, {} as Record<string, number>);

        const data = Object.entries(aggregatedData).map(([name, value]) => ({
          name:
            selectedField === "type"
              ? formatExpenseType(name as ExpenseType)
              : name,
          value,
        }));

        setChartData(data.sort((a, b) => b.value - a.value));
        setHiddenSegments(new Set());
      } catch (error) {
        console.error("Error fetching data for pie chart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, dateRange, selectedField, refreshKey]);

  const visibleData = useMemo(() => {
    return chartData.filter((item) => !hiddenSegments.has(item.name));
  }, [chartData, hiddenSegments]);

  const colors = chartInkWithAccent(chartData.length, 0);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = visibleData.reduce((s, i) => s + i.value, 0);
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : "0";
      return (
        <div className="rounded-md border border-border bg-card px-3 py-2 shadow-sm">
          <p className="text-ui font-medium">{data.name}</p>
          <p className="text-money-sm">{formattedAmount(data.value)}</p>
          <p className="text-meta">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const handleLegendClick = (name: string) => {
    setHiddenSegments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(name)) newSet.delete(name);
      else newSet.add(name);
      return newSet;
    });
  };

  return (
    <Card className="rounded-md border-border shadow-none">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
        <CardTitle className="text-section">Distribution</CardTitle>
        <Select
          value={selectedField}
          onValueChange={(value: FieldType) => setSelectedField(value)}
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="type">Type</SelectItem>
            <SelectItem value="paidBy">Payment</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="subcategory">Subcategory</SelectItem>
            <SelectItem value="tags">Tags</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[280px] items-center justify-center text-meta">Loading…</div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-meta">No data for this period</div>
        ) : (
          <>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={visibleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {visibleData.map((entry) => {
                      const colorIndex = chartData.findIndex((e) => e.name === entry.name);
                      return (
                        <Cell
                          key={entry.name}
                          fill={colors[colorIndex] ?? colors[0]}
                          opacity={activeIndex === null || activeIndex === colorIndex ? 1 : 0.5}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              {chartData.map((entry, index) => (
                <button
                  key={entry.name}
                  type="button"
                  onClick={() => handleLegendClick(entry.name)}
                  className={`flex items-center gap-2 text-ui transition-opacity ${
                    hiddenSegments.has(entry.name) ? "opacity-40" : "opacity-100"
                  }`}
                >
                  <span
                    className="size-2.5 rounded-sm"
                    style={{ backgroundColor: colors[index] }}
                  />
                  <span>
                    {entry.name} ({formattedAmount(entry.value)})
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
