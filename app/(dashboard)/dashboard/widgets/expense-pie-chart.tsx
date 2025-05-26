"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";
import { useFormattedCurrency } from "@/lib/currency-utils";
import { useEffect, useState, useMemo } from "react";
import { expenseService } from "@/lib/expense-service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { DateRange } from "react-day-picker";
import { useTheme } from "next-themes";

interface ExpensePieChartProps {
  userId: string;
  dateRange: DateRange;
}

type FieldType = "paidBy" | "category" | "subcategory" | "tags" | "type";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8",
  "#82CA9D", "#FFC658", "#FF6B6B", "#4ECDC4", "#45B7D1",
  "#96CEB4", "#FFEEAD", "#D4A5A5", "#9B59B6", "#3498DB"
];

export function ExpensePieChart({ userId, dateRange }: ExpensePieChartProps) {
  const formattedAmount = useFormattedCurrency();
  const { theme } = useTheme();
  const [selectedField, setSelectedField] = useState<FieldType>("type");
  const [chartData, setChartData] = useState<Array<{ name: string; value: number }>>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hiddenSegments, setHiddenSegments] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!dateRange.from || !dateRange.to) return;

        const expenses = await expenseService.getExpenses(
          userId,
          dateRange.from,
          dateRange.to
        );

        // Aggregate data based on selected field
        const aggregatedData = expenses.reduce((acc, expense) => {
          if (selectedField === "tags") {
            // Handle tags separately since they're an array
            expense.tags?.forEach(tag => {
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

        // Convert to array format for the chart
        const data = Object.entries(aggregatedData).map(([name, value]) => ({
          name,
          value,
        }));

        // Calculate total amount
        const total = data.reduce((sum, item) => sum + item.value, 0);
        setTotalAmount(total);

        // Sort data by value in descending order
        setChartData(data.sort((a, b) => b.value - a.value));
        // Reset hidden segments when data changes
        setHiddenSegments(new Set());
      } catch (error) {
        console.error("Error fetching data for pie chart:", error);
      }
    };

    fetchData();
  }, [userId, dateRange, selectedField]);

  const visibleData = useMemo(() => {
    return chartData.filter(item => !hiddenSegments.has(item.name));
  }, [chartData, hiddenSegments]);

  const visibleTotal = useMemo(() => {
    return visibleData.reduce((sum, item) => sum + item.value, 0);
  }, [visibleData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / visibleTotal) * 100).toFixed(1);
      return (
        <div className="bg-background border rounded-lg shadow-sm p-3">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-foreground">{formattedAmount(data.value)}</p>
          <p className="text-sm text-muted-foreground">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const handleLegendClick = (entry: any) => {
    const name = entry.payload.name;
    setHiddenSegments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">Expense Distribution</CardTitle>
          <Select
            value={selectedField}
            onValueChange={(value: FieldType) => setSelectedField(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="paidBy">Paid By</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="subcategory">Sub Category</SelectItem>
              <SelectItem value="tags">Tags</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <PieChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={visibleData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {visibleData.map((entry) => {
                  // Find the index in chartData for consistent color
                  const colorIndex = chartData.findIndex(e => e.name === entry.name);
                  return (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={COLORS[colorIndex % COLORS.length]}
                      opacity={activeIndex === colorIndex ? 1 : 0.8}
                    />
                  );
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {chartData.map((entry, index) => (
            <div
              key={entry.name}
              className="flex items-center gap-2 cursor-pointer hover:opacity-70"
              onClick={() => handleLegendClick({ payload: entry })}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-foreground">
                {entry.name} ({formattedAmount(entry.value)})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 