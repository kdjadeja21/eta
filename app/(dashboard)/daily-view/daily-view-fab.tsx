"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyViewFabProps {
  onClick: () => void;
  className?: string;
}

export function DailyViewFab({ onClick, className }: DailyViewFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add expense"
      className={cn(
        "fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom)+var(--vv-offset-bottom))] right-4 z-40 flex h-14 min-w-14 items-center justify-center gap-2 rounded-full md:bottom-6 md:right-6 md:z-50",
        "bg-primary px-0 text-[15px] font-semibold text-primary-foreground",
        "shadow-lg shadow-primary/25",
        "transition-transform active:scale-[0.97] sm:px-6 sm:text-base",
        className,
      )}
    >
      <Plus className="h-5 w-5 stroke-[2.5px]" />
      <span className="hidden sm:inline">Add Expense</span>
      <span className="sr-only sm:hidden">Add Expense</span>
    </button>
  );
}
