"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormattedCurrency } from "@/lib/currency-utils";
import { useEffect, useState } from "react";
import { expenseService } from "@/lib/expense-service";
import type { DateRange } from "react-day-picker";

interface TopSpendingCategoryCardProps {
  userId: string;
  dateRange: DateRange;
  refreshKey?: number;
}

export function TopSpendingCategoryCard({
  userId,
  dateRange,
  refreshKey,
}: TopSpendingCategoryCardProps) {
  const formattedAmount = useFormattedCurrency();
  const [topCategory, setTopCategory] = useState<{ category: string; amount: number }>({
    category: "",
    amount: 0,
  });

  useEffect(() => {
    const fetchTopCategory = async () => {
      try {
        if (!dateRange.from || !dateRange.to) return;

        const expensesByCategory = await expenseService.getExpensesByCategory(
          userId,
          dateRange.from,
          dateRange.to
        );

        const topCategoryEntry = Object.entries(expensesByCategory).reduce(
          (max, [category, amount]) =>
            amount > max.amount ? { category, amount } : max,
          { category: "", amount: 0 }
        );

        setTopCategory(topCategoryEntry);
      } catch (error) {
        console.error("Error fetching top category:", error);
      }
    };

    fetchTopCategory();
  }, [userId, dateRange, refreshKey]);

  return (
    <Card className="rounded-md border-border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-ui font-medium text-muted-foreground">
          Top category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-body font-medium truncate">
          {topCategory.category || "—"}
        </p>
        <p className="text-money-sm mt-1">{formattedAmount(topCategory.amount)}</p>
      </CardContent>
    </Card>
  );
}
