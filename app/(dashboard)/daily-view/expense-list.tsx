"use client";

import { useState, useMemo } from "react";
import { format, isToday } from "date-fns";
import { ArrowDownUp, Check, Receipt } from "lucide-react";
import { ExpenseListItem } from "./expense-list-item";
import type { Expense } from "@/lib/expense-service";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type SortKey = "createdAt_desc" | "createdAt_asc" | "amount_desc" | "amount_asc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "createdAt_desc", label: "Newest first" },
  { key: "createdAt_asc", label: "Oldest first" },
  { key: "amount_desc", label: "Amount: high to low" },
  { key: "amount_asc", label: "Amount: low to high" },
];

function sortExpenses(expenses: Expense[], sortKey: SortKey): Expense[] {
  return [...expenses].sort((a, b) => {
    switch (sortKey) {
      case "createdAt_desc":
        return (
          (b.createdAt ?? b.date).getTime() - (a.createdAt ?? a.date).getTime()
        );
      case "createdAt_asc":
        return (
          (a.createdAt ?? a.date).getTime() - (b.createdAt ?? b.date).getTime()
        );
      case "amount_desc":
        return b.amount - a.amount;
      case "amount_asc":
        return a.amount - b.amount;
    }
  });
}

interface ExpenseListProps {
  expenses: Expense[];
  selectedDate: Date;
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

function ExpenseListSkeleton() {
  const skeletonAccents = [
    "border-l-emerald-600/25",
    "border-l-blue-600/25",
    "border-l-amber-600/25",
    "border-l-emerald-600/25",
  ];

  return (
    <div className="space-y-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex animate-pulse items-center gap-3.5 rounded-xl border border-border/60 border-l-[3px] bg-card px-4 py-3.5",
            skeletonAccents[i]
          )}
        >
          <div className="h-10 w-10 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-3 w-36 rounded bg-muted" />
          </div>
          <div className="h-4 w-14 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function ExpenseList({
  expenses,
  selectedDate,
  isLoading,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt_desc");

  const sortedExpenses = useMemo(
    () => sortExpenses(expenses, sortKey),
    [expenses, sortKey]
  );

  const transactionLabel = isToday(selectedDate)
    ? `${expenses.length} transaction${expenses.length !== 1 ? "s" : ""} today`
    : `${expenses.length} transaction${expenses.length !== 1 ? "s" : ""}`;

  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label;

  return (
    <section className="mt-7 sm:mt-8">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-bold leading-tight text-foreground sm:text-xl">
            Expenses
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground sm:text-sm">
            {isLoading ? "Loading..." : transactionLabel}
          </p>
        </div>
        <div className="mt-0.5 flex shrink-0 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 rounded-full border-0 bg-card px-3 text-[12px] font-medium text-muted-foreground shadow-sm hover:bg-card/80 dark:shadow-none dark:ring-1 dark:ring-border"
              >
                <ArrowDownUp className="h-3 w-3" />
                {currentSortLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.key}
                  onClick={() => setSortKey(option.key)}
                  className="flex items-center justify-between gap-3"
                >
                  {option.label}
                  {sortKey === option.key && (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="rounded-full bg-card px-3 py-1 text-[12px] font-medium text-muted-foreground shadow-sm dark:shadow-none dark:ring-1 dark:ring-border">
            {format(selectedDate, "MMM d")}
          </span>
        </div>
      </div>

      {isLoading ? (
        <ExpenseListSkeleton />
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[20px] bg-card px-6 py-16 text-center shadow-[0_1px_8px_rgba(15,23,42,0.07)] dark:shadow-none dark:ring-1 dark:ring-border">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Receipt className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">No expenses yet</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {isToday(selectedDate)
              ? "Tap Add Expense to record your first transaction for today."
              : "No transactions were recorded on this day."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 pb-28 sm:space-y-3 sm:pb-24">
          {sortedExpenses.map((expense, index) => (
            <ExpenseListItem
              key={expense.id}
              expense={expense}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
