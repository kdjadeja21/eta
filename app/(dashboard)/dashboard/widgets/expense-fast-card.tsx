import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense } from "@/lib/expense-service";
import { eachDayOfInterval, formatDate } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface ExpenseFastCardProps {
  expenses: Expense[];
  dateRange: DateRange;
}

export function ExpenseFastCard({ expenses, dateRange }: ExpenseFastCardProps) {
  const fastDays = getExpenseFastDays(expenses, dateRange);
  const dayLabel = fastDays === 1 ? "day" : "days";

  return (
    <Card className="rounded-md border-border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-ui font-medium text-muted-foreground">
          Zero-spend days
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-money-md text-foreground">
          {fastDays} {dayLabel}
        </p>
        <p className="text-meta mt-1">In selected range</p>
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
