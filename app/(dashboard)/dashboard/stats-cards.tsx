import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Wallet } from "lucide-react";
import { useFormattedCurrency } from "@/lib/currency-utils";
import { expenseService } from "@/lib/expense-service";
import { useEffect, useState } from "react";
import CountUp from "@/components/count-up";

interface StatsCardsProps {
  totalExpenses: number;
  onHandCash: number;
}

export function StatsCards({ totalExpenses, onHandCash }: StatsCardsProps) {
  const formattedAmount = useFormattedCurrency();

  return (
    <div className="grid gap-4 md:grid-cols-2">
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
      <Card>
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
      </Card>
    </div>
  );
}
