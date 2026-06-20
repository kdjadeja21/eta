"use client";

import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/category-icons";
import { useFormattedCurrency } from "@/lib/currency-utils";
import { getExpenseTypeStyle } from "@/lib/expense-type-styles";
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
  const typeStyle = getExpenseTypeStyle(expense.type);

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
    <article
      role="button"
      tabIndex={0}
      onClick={() => onEdit(expense)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(expense);
        }
      }}
      aria-label={`Edit ${title}, ${formatCurrency(expense.amount)}`}
      className={cn(
        "group relative flex cursor-pointer items-center gap-3.5 overflow-hidden rounded-xl border border-border/60 border-l-[3px] px-4 py-3.5",
        "shadow-sm transition-[border-color,box-shadow,transform] duration-150 active:scale-[0.99] sm:gap-4 sm:p-4",
        "animate-in fade-in slide-in-from-bottom-1 fill-mode-both",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        typeStyle.card,
        typeStyle.accent,
        typeStyle.hover
      )}
      style={{ animationDelay: `${index * 40}ms`, animationDuration: "300ms" }}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 opacity-80 transition-opacity duration-150 group-hover:opacity-100",
          typeStyle.tint
        )}
      />

      <div
        className={cn(
          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11",
          bg
        )}
      >
        <Icon className={cn("h-[17px] w-[17px] sm:h-[18px] sm:w-[18px]", color)} />
      </div>

      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[15px] font-medium leading-tight text-foreground sm:text-base">
            {title}
          </p>
          <span
            className={cn(
              "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium tracking-wide",
              typeStyle.badge
            )}
          >
            {formatExpenseType(expense.type)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[13px] text-muted-foreground sm:text-sm">
          {subtitle}
        </p>
      </div>

      <p className="relative shrink-0 text-[15px] font-semibold tabular-nums text-foreground sm:text-base">
        {formatCurrency(expense.amount)}
      </p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Expense options"
            onClick={(e) => e.stopPropagation()}
            className="relative ml-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-36"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit(expense);
            }}
            className="cursor-pointer gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete(expense);
            }}
            className="cursor-pointer gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </article>
  );
}
