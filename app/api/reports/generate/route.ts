import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { expenseService } from "@/lib/expense-service";
import { reportService } from "@/lib/report-service";
import { categorizeExpenses } from "@/lib/ai-categorizer";
import { format, getDaysInMonth, differenceInCalendarDays, startOfMonth } from "date-fns";
import {
  getMonthDateRange,
  isCurrentMonth,
} from "@/lib/report-month-utils";
import type {
  CategoryBreakdown,
  DailyTotal,
  PaymentMethodBreakdown,
  ReportSummary,
} from "@/lib/report-service";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { month, timezoneOffset } = body as { month: string; timezoneOffset?: number };

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "month must be in YYYY-MM format" },
        { status: 400 }
      );
    }

    // Validate timezone offset: must be a finite number in the range [-840, 840].
    // Default to 0 (UTC) if not provided or invalid.
    const safeOffset =
      typeof timezoneOffset === "number" &&
      Number.isFinite(timezoneOffset) &&
      timezoneOffset >= -840 &&
      timezoneOffset <= 840
        ? timezoneOffset
        : 0;

    const existing = await reportService.getReportByMonth(userId, month);
    const regeneratingCurrentMonth = isCurrentMonth(month);

    if (existing && !regeneratingCurrentMonth) {
      return NextResponse.json({ reportId: existing.id, existing: true });
    }

    // For the current month: fall through and let createReport (setDoc) overwrite
    // the existing document atomically — no separate delete needed.

    const { monthStart, monthEnd, monthLabel, refDate } = getMonthDateRange(month, new Date(), safeOffset);

    const expenses = await expenseService.getExpenses(
      userId,
      monthStart,
      monthEnd
    );

    const uncategorized = expenses.filter(
      (e) => !e.category || e.category.trim() === ""
    );

    let aiCategorizedCount = 0;
    let aiInsights = "";

    if (uncategorized.length > 0) {
      const rawCategories = await expenseService.getCategories(userId);
      const existingCategories = rawCategories.map((c: any) => ({
        name: c.name as string,
        subcategories: (c.subcategories as string[]) ?? [],
      }));

      const result = await categorizeExpenses(
        uncategorized.map((e) => ({
          id: e.id,
          description: e.description,
          amount: e.amount,
        })),
        existingCategories,
        monthLabel
      );

      aiInsights = result.insights;
      aiCategorizedCount = result.categorizations.length;

      await Promise.all(
        result.categorizations.map((c) =>
          expenseService.updateExpense(c.id, {
            category: c.category,
            subcategory: c.subcategory,
          })
        )
      );

      for (const c of result.categorizations) {
        const exp = expenses.find((e) => e.id === c.id);
        if (exp) {
          exp.category = c.category;
          exp.subcategory = c.subcategory;
        }
      }
    }

    const summary = computeSummary(expenses, monthStart, monthEnd, refDate, month);

    const reportId = await reportService.createReport({
      userId,
      month,
      monthLabel,
      summary,
      aiCategorizedCount,
      aiInsights,
    });

    return NextResponse.json({
      reportId,
      existing: false,
      regenerated: Boolean(existing && regeneratingCurrentMonth),
    });
  } catch (error) {
    console.error("Report generation failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function computeSummary(
  expenses: Awaited<ReturnType<typeof expenseService.getExpenses>>,
  _monthStart: Date,
  _monthEnd: Date,
  refDate: Date,
  month: string,
): ReportSummary {
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const transactionCount = expenses.length;

  // For completed months use the actual calendar day count; for the current
  // (in-progress) month use the number of days elapsed so far.
  const daysInMonth = isCurrentMonth(month)
    ? differenceInCalendarDays(new Date(), startOfMonth(refDate)) + 1
    : getDaysInMonth(refDate);
  const avgDaily = transactionCount > 0 ? totalSpent / daysInMonth : 0;

  const largest = expenses.reduce(
    (max, e) => (e.amount > max.amount ? e : max),
    expenses[0] ?? { amount: 0, description: "" }
  );

  const categoryMap: Record<string, { amount: number; count: number }> = {};
  for (const e of expenses) {
    const cat = e.category || "Uncategorized";
    if (!categoryMap[cat]) categoryMap[cat] = { amount: 0, count: 0 };
    categoryMap[cat].amount += e.amount;
    categoryMap[cat].count += 1;
  }
  const byCategory: CategoryBreakdown[] = Object.entries(categoryMap)
    .map(([category, { amount, count }]) => ({
      category,
      amount,
      count,
      percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const byType = expenses.reduce(
    (acc, e) => {
      const t = e.type ?? "not_sure";
      acc[t as keyof typeof acc] = (acc[t as keyof typeof acc] ?? 0) + e.amount;
      return acc;
    },
    { need: 0, want: 0, not_sure: 0 }
  );

  const paymentMap: Record<string, { amount: number; count: number }> = {};
  for (const e of expenses) {
    const p = e.paidBy || "Unknown";
    if (!paymentMap[p]) paymentMap[p] = { amount: 0, count: 0 };
    paymentMap[p].amount += e.amount;
    paymentMap[p].count += 1;
  }
  const byPaymentMethod: PaymentMethodBreakdown[] = Object.entries(
    paymentMap
  ).map(([paidBy, { amount, count }]) => ({ paidBy, amount, count }));

  const dailyMap: Record<string, number> = {};
  for (const e of expenses) {
    const day = format(e.date, "yyyy-MM-dd");
    dailyMap[day] = (dailyMap[day] ?? 0) + e.amount;
  }
  const dailyTotals: DailyTotal[] = Object.entries(dailyMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalSpent,
    transactionCount,
    avgDaily,
    largestExpense: largest?.amount ?? 0,
    largestExpenseDescription: largest?.description ?? "",
    byCategory,
    byType,
    byPaymentMethod,
    dailyTotals,
    topCategories: byCategory.slice(0, 5),
  };
}
