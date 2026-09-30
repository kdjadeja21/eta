"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowDownUp, Check, MoreHorizontal, Pencil, Receipt, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFormattedCurrency } from "@/lib/currency-utils";
import type { Expense } from "@/lib/expense-service";
import { getExpenseTypeStyle } from "@/lib/expense-type-styles";
import { formatExpenseType } from "@/lib/types";
import { cn } from "@/lib/utils";

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
        return (b.createdAt ?? b.date).getTime() - (a.createdAt ?? a.date).getTime();
      case "createdAt_asc":
        return (a.createdAt ?? a.date).getTime() - (b.createdAt ?? b.date).getTime();
      case "amount_desc":
        return b.amount - a.amount;
      case "amount_asc":
        return a.amount - b.amount;
      default: {
        const exhaustive: never = sortKey;
        return exhaustive;
      }
    }
  });
}

interface DailyDesktopLedgerProps {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function DailyDesktopLedger({
  expenses,
  isLoading,
  onEdit,
  onDelete,
}: DailyDesktopLedgerProps) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt_desc");
  const sortedExpenses = useMemo(
    () => sortExpenses(expenses, sortKey),
    [expenses, sortKey],
  );
  const currentSortLabel = SORT_OPTIONS.find((option) => option.key === sortKey)?.label;

  return (
    <section className="min-w-0 rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold">Transactions</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isLoading
              ? "Loading…"
              : `${expenses.length} transaction${expenses.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowDownUp />
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
                {sortKey === option.key && <Check className="size-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <LedgerSkeleton />
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
            <Receipt className="size-5 text-muted-foreground" />
          </div>
          <p className="font-medium">No expenses yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add an expense to record a transaction for this day.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-3 py-3 font-medium">Description</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Paid by</th>
                <th className="px-3 py-3 text-right font-medium">Amount</th>
                <th className="px-3 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedExpenses.map((expense) => (
                <LedgerRow
                  key={expense.id}
                  expense={expense}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function LedgerRow({
  expense,
  onEdit,
  onDelete,
}: {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}) {
  const formatCurrency = useFormattedCurrency();
  const typeStyle = getExpenseTypeStyle(expense.type);
  const title =
    expense.description?.trim() || expense.subcategory || expense.category;
  const subtitle =
    expense.subcategory && expense.subcategory !== title ? expense.subcategory : null;

  return (
    <tr className="border-b last:border-b-0 hover:bg-muted/40">
      <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground tabular-nums">
        {format(expense.date, "h:mm a")}
      </td>
      <td className="max-w-[240px] px-3 py-3.5">
        <p className="truncate font-medium">{title}</p>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </td>
      <td className="max-w-[160px] px-3 py-3.5">
        <p className="truncate">{expense.category}</p>
      </td>
      <td className="px-3 py-3.5 whitespace-nowrap">
        <span
          className={cn(
            "inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium tracking-wide",
            typeStyle.badge,
          )}
        >
          {formatExpenseType(expense.type)}
        </span>
      </td>
      <td className="max-w-[140px] px-3 py-3.5 text-muted-foreground">
        <p className="truncate">{expense.paidBy}</p>
      </td>
      <td className="px-3 py-3.5 text-right font-medium whitespace-nowrap tabular-nums">
        {formatCurrency(expense.amount)}
      </td>
      <td className="px-3 py-3.5 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Expense options"
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => onEdit(expense)} className="cursor-pointer gap-2">
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(expense)}
              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

function LedgerSkeleton() {
  return (
    <div className="space-y-3 px-5 py-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-10 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  );
}
