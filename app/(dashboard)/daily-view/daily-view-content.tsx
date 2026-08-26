"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addDays,
  endOfDay,
  isAfter,
  isSameDay,
  startOfDay,
  subDays,
} from "date-fns";
import {
  expenseService,
  type Expense,
  type ExpenseFormData,
} from "@/lib/expense-service";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddExpenseDialog } from "../dashboard/add-expense-dialog";
import { DailyHeroCard } from "./daily-hero-card";
import { ExpenseList } from "./expense-list";
import {
  useRegisterAddExpense,
} from "@/components/app-shell/add-expense-context";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DailyViewContentProps {
  userId: string;
}

function calcTrendPercent(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? null : 100;
  }
  return Math.round(((current - previous) / previous) * 100);
}

export function DailyViewContent({ userId }: DailyViewContentProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [trendPercent, setTrendPercent] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const today = new Date();
  const canGoNext = !isSameDay(selectedDate, today);

  const openAdd = useCallback(() => {
    setEditingExpense(null);
    setIsAddOpen(true);
  }, []);

  useRegisterAddExpense(openAdd);

  const fetchDayData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const dayStart = startOfDay(selectedDate);
      const dayEnd = endOfDay(selectedDate);
      const yesterdayStart = startOfDay(subDays(selectedDate, 1));
      const yesterdayEnd = endOfDay(subDays(selectedDate, 1));

      const [dayExpenses, yesterdayTotal] = await Promise.all([
        expenseService.getExpenses(userId, dayStart, dayEnd),
        expenseService.getTotalExpenses(userId, yesterdayStart, yesterdayEnd),
      ]);

      const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

      setExpenses(dayExpenses);
      setTotalSpent(dayTotal);
      setTrendPercent(calcTrendPercent(dayTotal, yesterdayTotal));
    } catch (error) {
      console.error("Error fetching daily expenses:", error);
      setFetchError("Couldn't load this day.");
      setExpenses([]);
      setTotalSpent(0);
      setTrendPercent(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, userId]);

  useEffect(() => {
    fetchDayData();
  }, [fetchDayData]);

  const goToPrev = () => setSelectedDate((prev) => subDays(prev, 1));

  const goToNext = () => {
    if (!canGoNext) return;
    const next = addDays(selectedDate, 1);
    if (isAfter(startOfDay(next), startOfDay(today))) return;
    setSelectedDate(next);
  };

  const goToToday = () => setSelectedDate(new Date());

  const handleAddExpense = async (data: ExpenseFormData) => {
    try {
      const newExpense = {
        ...data,
        date: data.date ?? selectedDate,
        id: crypto.randomUUID(),
      };
      await expenseService.addExpense(userId, newExpense);
      showSuccessToast("Expense added");
      await fetchDayData();
    } catch (error) {
      console.error("Error adding expense:", error);
      showErrorToast("Failed to add expense");
      throw error;
    }
  };

  const handleUpdateExpense = async (data: ExpenseFormData) => {
    if (!editingExpense?.id) return;
    try {
      await expenseService.updateExpense(editingExpense.id, data);
      showSuccessToast("Expense updated");
      setEditingExpense(null);
      await fetchDayData();
    } catch (error) {
      console.error("Error updating expense:", error);
      showErrorToast("Failed to update expense");
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExpense?.id) return;
    setIsDeleting(true);
    try {
      await expenseService.deleteExpense(deletingExpense.id);
      showSuccessToast("Expense deleted");
      setDeletingExpense(null);
      await fetchDayData();
    } catch (error) {
      console.error("Error deleting expense:", error);
      showErrorToast("Failed to delete expense");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <div className="hidden md:mb-6 md:flex md:items-center md:justify-between">
        <h1 className="text-title">Today</h1>
        <Button onClick={openAdd} className="gap-2" aria-keyshortcuts="a">
          <Plus className="size-4" />
          Add
          <kbd className="ml-1 hidden rounded border border-primary-foreground/30 px-1.5 py-0.5 text-[10px] font-normal lg:inline">
            A
          </kbd>
        </Button>
      </div>

      <div className="md:grid md:grid-cols-[minmax(200px,280px)_1fr] md:gap-12 md:items-start">
        <DailyHeroCard
          selectedDate={selectedDate}
          totalSpent={totalSpent}
          trendPercent={trendPercent}
          isLoading={isLoading}
          loadError={fetchError}
          canGoNext={canGoNext}
          onPrev={goToPrev}
          onNext={goToNext}
          onGoToToday={goToToday}
        />

        <ExpenseList
          expenses={expenses}
          selectedDate={selectedDate}
          isLoading={isLoading}
          error={fetchError}
          onRetry={fetchDayData}
          onEdit={(expense) => setEditingExpense(expense)}
          onDelete={(expense) => setDeletingExpense(expense)}
        />
      </div>

      <AddExpenseDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSubmit={handleAddExpense}
        userId={userId}
        defaultDate={selectedDate}
      />

      <AddExpenseDialog
        open={!!editingExpense}
        onOpenChange={(open) => {
          if (!open) setEditingExpense(null);
        }}
        onSubmit={handleUpdateExpense}
        expense={editingExpense}
        userId={userId}
      />

      <AlertDialog
        open={!!deletingExpense}
        onOpenChange={(open) => {
          if (!open) setDeletingExpense(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete expense?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingExpense && (
                <>
                  &ldquo;
                  {deletingExpense.description?.trim() ||
                    deletingExpense.subcategory ||
                    deletingExpense.category}
                  &rdquo; will be permanently removed.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-primary-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
