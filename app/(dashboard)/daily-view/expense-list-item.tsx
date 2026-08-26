"use client";

import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormattedCurrency } from "@/lib/currency-utils";
import { formatExpenseType } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Expense } from "@/lib/expense-service";

interface ExpenseListItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseListItem({
  expense,
  onEdit,
  onDelete,
}: ExpenseListItemProps) {
  const formatCurrency = useFormattedCurrency();

  const title =
    expense.description?.trim() ||
    expense.subcategory ||
    expense.category;

  const detail = [expense.paidBy, expense.category, formatExpenseType(expense.type)]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="group flex items-start gap-3 border-b border-border py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="text-body font-medium text-foreground">{title}</p>
          <span className="text-meta">{formatExpenseType(expense.type)}</span>
        </div>
        <p className="mt-0.5 text-ui text-muted-foreground">
          {format(expense.date, "h:mm a")}
          {detail ? ` · ${detail}` : ""}
        </p>
      </div>

      <p className="text-money-sm shrink-0 text-foreground">{formatCurrency(expense.amount)}</p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Expense options"
            className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={() => onEdit(expense)} className="gap-2">
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(expense)}
            className="gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </article>
  );
}
