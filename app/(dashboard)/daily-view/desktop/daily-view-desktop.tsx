"use client";

import type { Expense } from "@/lib/expense-service";
import { DailyDesktopBrief } from "./daily-desktop-brief";
import { DailyDesktopLedger } from "./daily-desktop-ledger";

export interface DailyViewDesktopProps {
  selectedDate: Date;
  expenses: Expense[];
  totalSpent: number;
  trendPercent: number | null;
  isLoading: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoToToday: () => void;
  onAdd: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function DailyViewDesktop({
  selectedDate,
  expenses,
  totalSpent,
  trendPercent,
  isLoading,
  canGoNext,
  onPrev,
  onNext,
  onGoToToday,
  onAdd,
  onEdit,
  onDelete,
}: DailyViewDesktopProps) {
  return (
    <div className="hidden min-h-[calc(100dvh-4rem)] bg-background md:block">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-10 px-6 py-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-0 lg:px-10">
        <DailyDesktopBrief
          selectedDate={selectedDate}
          expenses={expenses}
          totalSpent={totalSpent}
          trendPercent={trendPercent}
          isLoading={isLoading}
          canGoNext={canGoNext}
          onPrev={onPrev}
          onNext={onNext}
          onGoToToday={onGoToToday}
        />
        <DailyDesktopLedger
          expenses={expenses}
          isLoading={isLoading}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
