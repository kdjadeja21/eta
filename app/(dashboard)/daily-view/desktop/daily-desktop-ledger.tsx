"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ArrowDownUp,
  Check,
  MoreHorizontal,
  Pencil,
  Plus,
  Receipt,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCategoryIcon } from "@/lib/category-icons";
import { useFormattedCurrency } from "@/lib/currency-utils";
import type { Expense } from "@/lib/expense-service";
import { PendingSyncBadge } from "@/components/pending-sync-icon";
import type { OptimisticExpense } from "@/hooks/use-optimistic-expenses";
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
  onAdd: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function DailyDesktopLedger({
  expenses,
  isLoading,
  onAdd,
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
    <section className="min-w-0 lg:border-l lg:pl-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Activity</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : `${expenses.length} transaction${expenses.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="gap-1.5">
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
          <Button type="button" size="sm" onClick={onAdd}>
            <Plus />
            Add expense
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
            <Receipt className="size-5 text-muted-foreground" />
          </div>
          <p className="font-medium">Nothing recorded</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Add an expense to start this day’s record.
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border/70">
          {sortedExpenses.map((expense) => (
            <LedgerRow
              key={expense.id}
              expense={expense}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function LedgerRow({
  expense,
  onEdit,
  onDelete,
}: {
  expense: OptimisticExpense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}) {
  const formatCurrency = useFormattedCurrency();
  const typeStyle = getExpenseTypeStyle(expense.type);
  const { icon: Icon, bg, color } = getCategoryIcon(expense.category);
  const title =
    expense.description?.trim() || expense.subcategory || expense.category;
  const meta = [expense.category, expense.subcategory, expense.paidBy]
    .filter((part, index, parts) => Boolean(part) && parts.indexOf(part) === index)
    .join(" · ");

  return (
    <li className="flex items-center gap-3 py-3.5">
      <time className="w-[4.5rem] shrink-0 text-xs tabular-nums text-muted-foreground">
        {format(expense.date, "h:mm a")}
      </time>
      <span className="relative shrink-0">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-lg",
            bg,
          )}
        >
          <Icon className={cn("size-4", color)} />
        </span>
        {expense.pending ? <PendingSyncBadge /> : null}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{meta}</p>
      </div>
      <span
        className={cn(
          "hidden shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium tracking-wide xl:inline-flex",
          typeStyle.badge,
        )}
      >
        {formatExpenseType(expense.type)}
      </span>
      <p className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums">
        {formatCurrency(expense.amount)}
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground"
            aria-label="Expense options"
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem
            disabled={expense.pending}
            onClick={() => onEdit(expense)}
            className="cursor-pointer gap-2"
          >
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={expense.pending}
            onClick={() => onDelete(expense)}
            className="cursor-pointer gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
