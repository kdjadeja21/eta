"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { useFormattedCurrency } from "@/lib/currency-utils";
import { useEffect, useState } from "react";
import { expenseService } from "@/lib/expense-service";
import type { DateRange } from "react-day-picker";

/**
 * Props for the PaymentMethodCard component
 * @interface PaymentMethodCardProps
 * @property {string} userId - The ID of the current user
 * @property {DateRange} dateRange - The selected date range for filtering
 * @property {number} [refreshKey] - Optional key to force refresh of the component
 */
interface PaymentMethodCardProps {
  userId: string;
  dateRange: DateRange;
  refreshKey?: number;
}

/**
 * PaymentMethodCard component displays the payment method with the highest spending
 * @param {PaymentMethodCardProps} props - The component props
 * @returns {JSX.Element} The rendered component
 */
export function PaymentMethodCard({ userId, dateRange, refreshKey }: PaymentMethodCardProps) {
  const formattedAmount = useFormattedCurrency();
  const [topPaymentMethod, setTopPaymentMethod] = useState<{ method: string; amount: number }>({ method: "", amount: 0 });

  useEffect(() => {
    const fetchTopPaymentMethod = async () => {
      try {
        if (!dateRange.from || !dateRange.to) return;

        const expenses = await expenseService.getExpenses(
          userId,
          dateRange.from,
          dateRange.to
        );

        // Aggregate expenses by payment method
        const paymentMethods = expenses.reduce((acc, expense) => {
          const method = expense.paidBy;
          acc[method] = (acc[method] || 0) + expense.amount;
          return acc;
        }, {} as Record<string, number>);

        // Find the payment method with the highest amount
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Top Payment Method</CardTitle>
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {topPaymentMethod.method || "No data"}
        </div>
        <p className="text-xs text-muted-foreground">
          {formattedAmount(topPaymentMethod.amount)}
        </p>
      </CardContent>
    </Card>
  );
} 