"use client";

import type { Expense } from "@/lib/expense-service";
import { DailyDesktopBreakdown } from "./daily-desktop-breakdown";
import { DailyDesktopHeader } from "./daily-desktop-header";
import { DailyDesktopLedger } from "./daily-desktop-ledger";
import { DailyDesktopMetrics } from "./daily-desktop-metrics";

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
    <div className="hidden min-h-[calc(100dvh-4rem)] bg-muted md:block">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 lg:px-8">
        <DailyDesktopHeader
          selectedDate={selectedDate}
          canGoNext={canGoNext}
          onPrev={onPrev}
          onNext={onNext}
          onGoToToday={onGoToToday}
          onAdd={onAdd}
        />
        <DailyDesktopMetrics
          expenses={expenses}
          totalSpent={totalSpent}
          trendPercent={trendPercent}
          isLoading={isLoading}
        />
        <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <DailyDesktopBreakdown expenses={expenses} isLoading={isLoading} />
          <DailyDesktopLedger
            expenses={expenses}
            isLoading={isLoading}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}
