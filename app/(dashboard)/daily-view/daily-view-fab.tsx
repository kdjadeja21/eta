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
        "fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-2 rounded-full md:bottom-6 md:right-6 md:z-50",
        "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-500",
        "p-3.5 text-[15px] font-semibold text-white",
        "shadow-[0_12px_32px_-8px_rgba(99,102,241,0.55)]",
        "transition-transform active:scale-[0.97]",
        "sm:px-6 sm:py-4 sm:text-base sm:hover:scale-105",
        className
      )}
    >
      <Plus className="h-5 w-5 stroke-[2.5px]" />
      <span className="hidden sm:inline">Add Expense</span>
      <span className="sr-only sm:hidden">Add Expense</span>
    </button>
  );
}
