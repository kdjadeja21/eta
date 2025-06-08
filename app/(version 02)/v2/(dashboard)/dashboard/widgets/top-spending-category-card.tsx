"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";
import { useFormattedCurrency } from "@/lib/currency-utils";
import { useEffect, useState } from "react";
import { expenseService } from "@/lib/expense-service";
import type { DateRange } from "react-day-picker";

/**
 * Props for the TopSpendingCategoryCard component
 * @interface TopSpendingCategoryCardProps
 * @property {string} userId - The ID of the current user
 * @property {DateRange} dateRange - The selected date range for filtering
 * @property {number} [refreshKey] - Optional key to force refresh of the component
 */
interface TopSpendingCategoryCardProps {
  userId: string;
  dateRange: DateRange;
  refreshKey?: number;
}

/**
 * TopSpendingCategoryCard component displays the category with the highest spending
 * @param {TopSpendingCategoryCardProps} props - The component props
 * @returns {JSX.Element} The rendered component
 */
export function TopSpendingCategoryCard({ userId, dateRange, refreshKey }: TopSpendingCategoryCardProps) {
  const formattedAmount = useFormattedCurrency();
  const [topCategory, setTopCategory] = useState<{ category: string; amount: number }>({ category: "", amount: 0 });

  useEffect(() => {
    const fetchTopCategory = async () => {
      try {
        if (!dateRange.from || !dateRange.to) return;

        const expensesByCategory = await expenseService.getExpensesByCategory(
          userId,
          dateRange.from,
          dateRange.to
        );

        // Find the category with the highest amount
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Top Spending Category</CardTitle>
        <PieChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {topCategory.category || "No data"}
        </div>
        <p className="text-xs text-muted-foreground">
          {formattedAmount(topCategory.amount)}
        </p>
      </CardContent>
    </Card>
  );
} 