"use client";

import { useState, useMemo } from "react";
import { format, isToday } from "date-fns";
import { ArrowDownUp, Check, Receipt } from "lucide-react";
import { ExpenseListItem } from "./expense-list-item";
import type { Expense } from "@/lib/expense-service";
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
      default: {
        const _exhaustive: never = sortKey;
        return _exhaustive;
      }
    }
  });
}

interface ExpenseListProps {
  expenses: Expense[];
  selectedDate: Date;
  isLoading: boolean;
  error?: string | null;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

function ExpenseListSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex animate-pulse gap-3 py-4">
          <div className="h-5 flex-1 rounded bg-muted" />
          <div className="h-5 w-16 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function ExpenseList({
  expenses,
  selectedDate,
  isLoading,
  error,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt_desc");

  const sortedExpenses = useMemo(
    () => sortExpenses(expenses, sortKey),
    [expenses, sortKey]
  );

  const transactionLabel = isToday(selectedDate)
    ? `${expenses.length} receipt${expenses.length !== 1 ? "s" : ""} today`
    : `${expenses.length} receipt${expenses.length !== 1 ? "s" : ""}`;

  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label;

  return (
    <section className="w-full max-w-xl">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="text-section">Receipts</h2>
          <p className="text-meta mt-0.5">
            {isLoading ? "Loading…" : error ? "Could not load" : transactionLabel}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <ArrowDownUp className="size-3.5" />
              <span className="hidden sm:inline">{currentSortLabel}</span>
              <span className="sm:hidden">Sort</span>
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
                {sortKey === option.key && <Check className="size-3.5" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-[var(--danger-soft)] px-4 py-8 text-center">
          <p className="text-ui text-destructive">{error}</p>
        </div>
      ) : isLoading ? (
        <ExpenseListSkeleton />
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border px-6 py-16 text-center">
          <Receipt className="mb-3 size-8 text-muted-foreground" aria-hidden />
          <p className="text-ui font-medium text-foreground">No receipts</p>
          <p className="mt-1 max-w-xs text-meta">
            {isToday(selectedDate)
              ? "Use Add to record your first expense for today."
              : "Nothing was recorded on this day."}
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-border bg-card px-4">
          {sortedExpenses.map((expense) => (
            <ExpenseListItem
              key={expense.id}
              expense={expense}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
