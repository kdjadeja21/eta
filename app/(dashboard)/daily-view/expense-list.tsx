"use client";

import { format, isToday } from "date-fns";
import { Receipt } from "lucide-react";
import { ExpenseListItem } from "./expense-list-item";
import type { Expense } from "@/lib/expense-service";

interface ExpenseListProps {
  expenses: Expense[];
  selectedDate: Date;
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

function ExpenseListSkeleton() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-3.5 rounded-[20px] bg-card px-4 py-3.5"
        >
          <div className="h-11 w-11 rounded-full bg-muted" />
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
  const transactionLabel = isToday(selectedDate)
    ? `${expenses.length} transaction${expenses.length !== 1 ? "s" : ""} today`
    : `${expenses.length} transaction${expenses.length !== 1 ? "s" : ""}`;

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
        <span className="mt-0.5 shrink-0 rounded-full bg-card px-3 py-1 text-[12px] font-medium text-muted-foreground shadow-sm dark:shadow-none dark:ring-1 dark:ring-border">
          {format(selectedDate, "MMM d")}
        </span>
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
          {expenses.map((expense, index) => (
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
