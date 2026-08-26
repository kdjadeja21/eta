"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormattedCurrency } from "@/lib/currency-utils";
import { useEffect, useState } from "react";
import { expenseService } from "@/lib/expense-service";
import type { DateRange } from "react-day-picker";

interface PaymentMethodCardProps {
  userId: string;
  dateRange: DateRange;
  refreshKey?: number;
}

export function PaymentMethodCard({
  userId,
  dateRange,
  refreshKey,
}: PaymentMethodCardProps) {
  const formattedAmount = useFormattedCurrency();
  const [topPaymentMethod, setTopPaymentMethod] = useState<{
    method: string;
    amount: number;
  }>({ method: "", amount: 0 });

  useEffect(() => {
    const fetchTopPaymentMethod = async () => {
      try {
        if (!dateRange.from || !dateRange.to) return;

        const expenses = await expenseService.getExpenses(
          userId,
          dateRange.from,
          dateRange.to
        );

        const paymentMethods = expenses.reduce(
          (acc, expense) => {
            const method = expense.paidBy;
            acc[method] = (acc[method] || 0) + expense.amount;
            return acc;
          },
          {} as Record<string, number>
        );

        const topMethodEntry = Object.entries(paymentMethods).reduce(
          (max, [method, amount]) =>
            amount > max.amount ? { method, amount } : max,
          { method: "", amount: 0 }
        );

        setTopPaymentMethod(topMethodEntry);
      } catch (error) {
        console.error("Error fetching top payment method:", error);
      }
    };

    fetchTopPaymentMethod();
  }, [userId, dateRange, refreshKey]);

  return (
    <Card className="rounded-md border-border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-ui font-medium text-muted-foreground">
          Top payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-body font-medium truncate">
          {topPaymentMethod.method || "—"}
        </p>
        <p className="text-money-sm mt-1">{formattedAmount(topPaymentMethod.amount)}</p>
      </CardContent>
    </Card>
  );
}
