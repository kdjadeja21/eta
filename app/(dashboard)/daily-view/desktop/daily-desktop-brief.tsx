"use client";

import type { ReactNode } from "react";
import { format, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import { useFormattedCurrency } from "@/lib/currency-utils";
import type { Expense } from "@/lib/expense-service";
import { ExpenseType, formatExpenseType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { summarizeDay } from "./summarize-day";

interface DailyDesktopBriefProps {
  selectedDate: Date;
  expenses: Expense[];
  totalSpent: number;
  trendPercent: number | null;
  isLoading: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoToToday: () => void;
}

export function DailyDesktopBrief({
  selectedDate,
  expenses,
  totalSpent,
  trendPercent,
  isLoading,
  canGoNext,
  onPrev,
  onNext,
  onGoToToday,
}: DailyDesktopBriefProps) {
  const formatCurrency = useFormattedCurrency();
  const { categories, types, transactionCount } = summarizeDay(expenses);
  const viewingToday = isToday(selectedDate);

  return (
    <aside className="lg:pr-10">
      <div className="flex items-center gap-4">
        <DayStepButton label="Previous day" onClick={onPrev}>
          <ChevronLeft className="size-4" />
        </DayStepButton>
        <div className="min-w-0">
          <p className="text-5xl font-semibold tracking-tight tabular-nums">
            {format(selectedDate, "d")}
          </p>
          <p className="mt-1 text-sm font-medium">
            {format(selectedDate, "MMMM yyyy")}
          </p>
          <p className="text-sm text-muted-foreground">
            {viewingToday ? "Today" : format(selectedDate, "EEEE")}
          </p>
        </div>
        <DayStepButton label="Next day" onClick={onNext} disabled={!canGoNext}>
          <ChevronRight className="size-4" />
        </DayStepButton>
      </div>

      {!viewingToday && (
        <button
          type="button"
          onClick={onGoToToday}
          className="mt-4 text-sm font-medium text-primary hover:underline"
        >
          Jump to today
        </button>
      )}

      <div className="mt-8">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Spent
        </p>
        {isLoading ? (
          <div className="mt-3 h-10 w-40 animate-pulse rounded-md bg-muted" />
        ) : (
          <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">
            {formatCurrency(totalSpent)}
          </p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          {isLoading
            ? "Loading this day…"
            : daySummary(transactionCount, trendPercent)}
        </p>
      </div>

      <TypeMix
        types={types}
        totalSpent={totalSpent}
        isLoading={isLoading}
        formatCurrency={formatCurrency}
      />

      <div className="mt-8">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Categories
        </p>
        {isLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-8 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No spending recorded for this day.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border/70">
            {categories.map(({ category, amount }) => {
              const { icon: Icon, color } = getCategoryIcon(category);
              const share =
                totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;

              return (
                <li key={category} className="flex items-center gap-3 py-2.5">
                  <Icon className={cn("size-4 shrink-0", color)} />
                  <span className="min-w-0 flex-1 truncate text-sm">{category}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {share}%
                  </span>
                  <span className="w-24 text-right text-sm tabular-nums">
                    {formatCurrency(amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

function TypeMix({
  types,
  totalSpent,
  isLoading,
  formatCurrency,
}: {
  types: { type: ExpenseType; amount: number }[];
  totalSpent: number;
  isLoading: boolean;
  formatCurrency: (amount: number) => string;
}) {
  if (isLoading) {
    return <div className="mt-6 h-2 animate-pulse rounded-full bg-muted" />;
  }

  return (
    <div className="mt-6">
      <div className="flex h-2 overflow-hidden rounded-full bg-muted">
        {types.map((entry) => {
          const width = totalSpent > 0 ? (entry.amount / totalSpent) * 100 : 0;
          if (width <= 0) return null;
          return (
            <div
              key={entry.type}
              className={typeBarClass(entry.type)}
              style={{ width: `${width}%` }}
            />
          );
        })}
      </div>
      <ul className="mt-3 space-y-1.5">
        {types.map((entry) => (
          <li key={entry.type} className="flex items-center gap-2 text-sm">
            <span className={cn("size-2 rounded-full", typeBarClass(entry.type))} />
            <span className="flex-1 text-muted-foreground">
              {formatExpenseType(entry.type)}
            </span>
            <span className="tabular-nums">{formatCurrency(entry.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DayStepButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-9 items-center justify-center rounded-full border bg-background text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function daySummary(count: number, trendPercent: number | null) {
  const transactions = `${count} transaction${count === 1 ? "" : "s"}`;
  if (trendPercent === null) return transactions;
  if (trendPercent === 0) return `${transactions} · same as yesterday`;
  const direction = trendPercent > 0 ? "more" : "less";
  return `${transactions} · ${Math.abs(trendPercent)}% ${direction} than yesterday`;
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
