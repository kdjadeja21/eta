"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CountUp from "@/components/count-up";
import type { DateRange } from "react-day-picker";

interface AverageDailyExpensesCardProps {
  totalExpenses: number;
  dateRange: DateRange;
}

export function AverageDailyExpensesCard({
  totalExpenses,
  dateRange,
}: AverageDailyExpensesCardProps) {
  const daysDiff =
    dateRange.from && dateRange.to
      ? Math.ceil(
          (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1
      : 1;

  const averageDailyExpenses = totalExpenses / daysDiff;

  return (
    <Card className="rounded-md border-border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-ui font-medium text-muted-foreground">
          Daily average
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-money-md text-foreground">
          <CountUp end={averageDailyExpenses} duration={300} />
        </p>
        <p className="text-meta mt-1">Per day in period</p>
      </CardContent>
    </Card>
  );
}
