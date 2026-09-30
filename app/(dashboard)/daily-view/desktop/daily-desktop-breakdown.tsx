"use client";

import { useFormattedCurrency } from "@/lib/currency-utils";
import { getCategoryIcon } from "@/lib/category-icons";
import type { Expense } from "@/lib/expense-service";
import { ExpenseType, formatExpenseType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { summarizeDay } from "./summarize-day";

interface DailyDesktopBreakdownProps {
  expenses: Expense[];
  isLoading: boolean;
}

export function DailyDesktopBreakdown({
  expenses,
  isLoading,
}: DailyDesktopBreakdownProps) {
  const formatCurrency = useFormattedCurrency();
  const { categories, types } = summarizeDay(expenses);
  const categoryMax = categories[0]?.amount ?? 0;
  const typeMax = Math.max(...types.map((entry) => entry.amount), 0);

  return (
    <aside className="flex flex-col gap-6">
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold">By category</h2>
        {isLoading ? (
          <BreakdownSkeleton rows={4} />
        ) : categories.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No spending recorded for this day.
          </p>
        ) : (
          <ul className="mt-4 space-y-3.5">
            {categories.map(({ category, amount }) => {
              const { icon: Icon, bg, color } = getCategoryIcon(category);
              const width =
                categoryMax > 0 ? Math.max((amount / categoryMax) * 100, 4) : 0;

              return (
                <li key={category}>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-md",
                        bg,
                      )}
                    >
                      <Icon className={cn("size-3.5", color)} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {category}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold">By type</h2>
        {isLoading ? (
          <BreakdownSkeleton rows={3} />
        ) : (
          <ul className="mt-4 space-y-3.5">
            {types.map((entry) => {
              const width =
                typeMax > 0 ? Math.max((entry.amount / typeMax) * 100, entry.amount > 0 ? 4 : 0) : 0;

              return (
                <li key={entry.type}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{formatExpenseType(entry.type)}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatCurrency(entry.amount)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", typeBarClass(entry.type))}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </aside>
  );
}

function typeBarClass(type: ExpenseType): string {
  switch (type) {
    case ExpenseType.Need:
      return "bg-emerald-500";
    case ExpenseType.Want:
      return "bg-blue-500";
    case ExpenseType.NotSure:
      return "bg-amber-500";
    default: {
      const exhaustive: never = type;
      return exhaustive;
    }
  }
}

function BreakdownSkeleton({ rows }: { rows: number }) {
  return (
    <div className="mt-4 space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-1.5 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}
