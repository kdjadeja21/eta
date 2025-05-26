import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Wallet } from "lucide-react";
import { useFormattedCurrency } from "@/lib/currency-utils";
import { expenseService } from "@/lib/expense-service";
import { useEffect, useState } from "react";
import CountUp from "@/components/count-up";
import { AverageDailyExpensesCard } from "./widgets/average-daily-expenses-card";
import { TopSpendingCategoryCard } from "./widgets/top-spending-category-card";
import { PaymentMethodCard } from "./widgets/payment-method-card";
import type { DateRange } from "react-day-picker";

interface StatsCardsProps {
  totalExpenses: number;
  onHandCash: number;
  userId: string;
  dateRange: DateRange;
}

export function StatsCards({ totalExpenses, onHandCash, userId, dateRange }: StatsCardsProps) {
  const formattedAmount = useFormattedCurrency();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <CountUp end={totalExpenses} duration={300} />
          </div>
          <p className="text-xs text-muted-foreground">
            For the selected date range
          </p>
        </CardContent>
      </Card>
      {/* TODO: Add on-hand cash card */}
      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">On-Hand Cash</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <CountUp end={onHandCash} duration={300} />
          </div>
          <p className="text-xs text-muted-foreground">
            Cash withdrawals minus cash expenses
          </p>
        </CardContent>
      </Card> */}

      <AverageDailyExpensesCard 
        totalExpenses={totalExpenses}
        dateRange={dateRange}
      />

      <TopSpendingCategoryCard 
        userId={userId}
        dateRange={dateRange}
      />

      <PaymentMethodCard 
        userId={userId}
        dateRange={dateRange}
      />
    </div>
  );
}
