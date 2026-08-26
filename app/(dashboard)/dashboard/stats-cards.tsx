"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense } from "@/lib/expense-service";
import CountUp from "@/components/count-up";
import { AverageDailyExpensesCard } from "./widgets/average-daily-expenses-card";
import { TopSpendingCategoryCard } from "./widgets/top-spending-category-card";
import { PaymentMethodCard } from "./widgets/payment-method-card";
import { ExpenseFastCard } from "./widgets/expense-fast-card";
import type { DateRange } from "react-day-picker";
import { useFormattedCurrency } from "@/lib/currency-utils";

interface StatsCardsProps {
  totalExpenses: number;
  onHandCash: number;
  expenses: Expense[];
  userId: string;
  dateRange: DateRange;
  refreshKey?: number;
}

export function StatsCards({
  totalExpenses,
  expenses,
  userId,
  dateRange,
  refreshKey,
}: StatsCardsProps) {
  const formatCurrency = useFormattedCurrency();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Card className="rounded-md border-border shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-ui font-medium text-muted-foreground">
            Period total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-money-md text-foreground">
            <CountUp end={totalExpenses} duration={300} />
          </p>
        </CardContent>
      </Card>

      <AverageDailyExpensesCard totalExpenses={totalExpenses} dateRange={dateRange} />

      <ExpenseFastCard expenses={expenses} dateRange={dateRange} />

      <TopSpendingCategoryCard
        userId={userId}
        dateRange={dateRange}
        refreshKey={refreshKey}
      />

      <PaymentMethodCard
        userId={userId}
        dateRange={dateRange}
        refreshKey={refreshKey}
      />
    </div>
  );
}
