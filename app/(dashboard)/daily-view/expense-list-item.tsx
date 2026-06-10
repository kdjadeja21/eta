"use client";

import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/category-icons";
import { useFormattedCurrency } from "@/lib/currency-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Expense } from "@/lib/expense-service";

interface ExpenseListItemProps {
  expense: Expense;
  index: number;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseListItem({
  expense,
  index,
  onEdit,
  onDelete,
}: ExpenseListItemProps) {
  const formatCurrency = useFormattedCurrency();
  const { icon: Icon, bg, color } = getCategoryIcon(expense.category);

  const title =
    expense.description?.trim() ||
    expense.subcategory ||
    expense.category;

  const detail =
    expense.subcategory && expense.subcategory !== title
      ? expense.subcategory
      : expense.category;

  const subtitle = [format(expense.date, "h:mm a"), detail]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={cn(
        "flex items-center gap-3.5 rounded-[20px] bg-card px-4 py-3.5",
        "shadow-[0_1px_8px_rgba(15,23,42,0.07)] dark:shadow-none dark:ring-1 dark:ring-border",
        "transition-all duration-200 sm:gap-4 sm:p-4 sm:hover:-translate-y-0.5 sm:hover:shadow-md",
        "animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
      )}
      style={{ animationDelay: `${index * 50}ms`, animationDuration: "350ms" }}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12",
          bg
        )}
      >
        <Icon className={cn("h-[18px] w-[18px] sm:h-5 sm:w-5", color)} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold leading-tight text-card-foreground sm:text-base">
          {title}
        </p>
        <p className="mt-0.5 truncate text-[13px] text-muted-foreground sm:text-sm">
          {subtitle}
        </p>
      </div>

      <p className="shrink-0 text-[15px] font-bold text-card-foreground sm:text-base">
        {formatCurrency(expense.amount)}
      </p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Expense options"
            className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem
            onClick={() => onEdit(expense)}
            className="cursor-pointer gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(expense)}
            className="cursor-pointer gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
