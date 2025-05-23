"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense } from "@/lib/expense-service";
import type { DateRange } from "react-day-picker";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { format, eachDayOfInterval, isSameDay } from "date-fns";

interface ExpenseChartProps {
  expenses: Expense[];
  dateRange: DateRange | undefined;
}

export function ExpenseChart({ expenses, dateRange }: ExpenseChartProps) {
  if (!dateRange?.from || !dateRange?.to) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Expenses</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">
            Select a date range to view expenses
          </p>
        </CardContent>
      </Card>
    );
  }

  // Generate all days in the date range
  const days = eachDayOfInterval({
    start: dateRange.from,
    end: dateRange.to,
  });

  // Calculate daily totals
  const dailyData = days.map((day) => {
    const dayExpenses = expenses.filter((expense) =>
      isSameDay(expense.date, day)
    );

    const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    return {
      date: format(day, "MMM dd"),
      total,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Expenses</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer
          config={{
            total: {
              label: "Amount",
              color: "hsl(var(--chart-1))",
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
                width={80}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="var(--color-total)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
