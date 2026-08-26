import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense } from "@/lib/expense-service";
import CountUp from "@/components/count-up";
import { AverageDailyExpensesCard } from "./widgets/average-daily-expenses-card";
import { TopSpendingCategoryCard } from "./widgets/top-spending-category-card";
import { PaymentMethodCard } from "./widgets/payment-method-card";
import { ExpenseFastCard } from "./widgets/expense-fast-card";
import type { DateRange } from "react-day-picker";

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
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Period total — the one loud thing on this page */}
      <Card className="col-span-2 border-primary bg-primary text-primary-foreground lg:col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-[0.14em] text-primary-foreground/80">
            Total spent this period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-money text-4xl font-semibold sm:text-5xl">
            <CountUp end={totalExpenses} duration={300} />
          </div>
        </CardContent>
      </Card>

      <AverageDailyExpensesCard
        totalExpenses={totalExpenses}
        dateRange={dateRange}
      />

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
