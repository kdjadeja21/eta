"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";
import { useFormattedCurrency } from "@/lib/currency-utils";
import CountUp from "@/components/count-up";
import type { DateRange } from "react-day-picker";

interface AverageDailyExpensesCardProps {
  totalExpenses: number;
  dateRange: DateRange;
}

export function AverageDailyExpensesCard({ totalExpenses, dateRange }: AverageDailyExpensesCardProps) {
  const formattedAmount = useFormattedCurrency();
  
  // Calculate number of days in the date range
  const daysDiff = dateRange.from && dateRange.to
    ? Math.ceil(
        (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1
    : 1;
  
  // Calculate average daily expenses
  const averageDailyExpenses = totalExpenses / daysDiff;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Average Daily Expenses</CardTitle>
        <BarChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <CountUp end={averageDailyExpenses} duration={300} />
        </div>
        <p className="text-xs text-muted-foreground">
          Per day average for the period
        </p>
      </CardContent>
    </Card>
  );
} 