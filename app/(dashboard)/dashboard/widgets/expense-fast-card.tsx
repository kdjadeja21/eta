import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense } from "@/lib/expense-service";
import { eachDayOfInterval, formatDate } from "@/lib/utils";
import { Leaf } from "lucide-react";
import type { DateRange } from "react-day-picker";

interface ExpenseFastCardProps {
  expenses: Expense[];
  dateRange: DateRange;
}

export function ExpenseFastCard({ expenses, dateRange }: ExpenseFastCardProps) {
  const fastDays = getExpenseFastDays(expenses, dateRange);
  const dayLabel = fastDays === 1 ? "day" : "days";

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-emerald-50 to-teal-50 dark:border-primary/20 dark:from-primary/10 dark:via-emerald-950/30 dark:to-slate-900/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Expense Fast</CardTitle>
        <Leaf className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">
          {fastDays} {dayLabel}
        </div>
        <p className="text-xs text-muted-foreground">
          Zero-spend days in selected range
        </p>
      </CardContent>
    </Card>
  );
}

function getExpenseFastDays(expenses: Expense[], dateRange: DateRange) {
  if (!dateRange.from || !dateRange.to) {
    return 0;
  }

  const dailyTotals = expenses.reduce((totals, expense) => {
    const dateKey = formatDate(expense.date, "yyyy-MM-dd");
    totals[dateKey] = (totals[dateKey] ?? 0) + expense.amount;
    return totals;
  }, {} as Record<string, number>);

  return eachDayOfInterval({
    start: dateRange.from,
    end: dateRange.to,
  }).filter((date) => {
    const dateKey = formatDate(date, "yyyy-MM-dd");
    return (dailyTotals[dateKey] ?? 0) === 0;
  }).length;
}
