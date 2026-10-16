import {
  endOfWeek,
  isBefore,
  startOfDay,
  startOfWeek,
} from "date-fns";
import type { Expense } from "@/lib/expense-service";
import { eachDayOfInterval, formatDate } from "@/lib/utils";

/** Calendar week starts Sunday (US default). */
export const EXPENSE_FAST_WEEK_STARTS_ON = 0 as const;

export function buildDailyTotals(expenses: Expense[]): Record<string, number> {
  return expenses.reduce((totals, expense) => {
    const dateKey = formatDate(expense.date, "yyyy-MM-dd");
    totals[dateKey] = (totals[dateKey] ?? 0) + expense.amount;
    return totals;
  }, {} as Record<string, number>);
}

export function countExpenseFastDaysInInterval(
  dailyTotals: Record<string, number>,
  start: Date,
  end: Date,
): number {
  return eachDayOfInterval({ start, end }).filter((date) => {
    const dateKey = formatDate(date, "yyyy-MM-dd");
    return (dailyTotals[dateKey] ?? 0) === 0;
  }).length;
}

/**
 * Counts completed zero-spend days in the calendar week containing `weekAnchorDate`.
 * Today is never counted until the day is over.
 */
export function countCompletedExpenseFastDaysInWeek(
  expenses: Expense[],
  weekAnchorDate: Date,
  today: Date = new Date(),
): number {
  const dailyTotals = buildDailyTotals(expenses);
  const weekStart = startOfWeek(weekAnchorDate, {
    weekStartsOn: EXPENSE_FAST_WEEK_STARTS_ON,
  });
  const weekEnd = endOfWeek(weekAnchorDate, {
    weekStartsOn: EXPENSE_FAST_WEEK_STARTS_ON,
  });
  const todayStart = startOfDay(today);

  return eachDayOfInterval({ start: weekStart, end: weekEnd }).filter((date) => {
    if (!isBefore(startOfDay(date), todayStart)) {
      return false;
    }
    const dateKey = formatDate(date, "yyyy-MM-dd");
    return (dailyTotals[dateKey] ?? 0) === 0;
  }).length;
}
