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
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/ui/toast";
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
import { DailyViewDesktop } from "./desktop/daily-view-desktop";
import { useRegisterMobileAddExpense } from "../mobile-add-expense";

interface DailyViewContentProps {
  userId: string;
  initialAddOpen?: boolean;
}

function calcTrendPercent(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? null : 100;
  }
  return Math.round(((current - previous) / previous) * 100);
}

export function DailyViewContent({
  userId,
  initialAddOpen = false,
}: DailyViewContentProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [trendPercent, setTrendPercent] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(initialAddOpen);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const openAddExpense = useCallback(() => setIsAddOpen(true), []);
  useRegisterMobileAddExpense(openAddExpense);

  const today = new Date();
  const canGoNext = !isSameDay(selectedDate, today);

  const fetchDayData = useCallback(async () => {
    setIsLoading(true);
    try {
      const dayStart = startOfDay(selectedDate);
      const dayEnd = endOfDay(selectedDate);
      const yesterdayStart = startOfDay(subDays(selectedDate, 1));
      const yesterdayEnd = endOfDay(subDays(selectedDate, 1));

      const [dayExpenses, yesterdayTotal] = await Promise.all([
        expenseService.getExpenses(userId, dayStart, dayEnd),
        expenseService.getTotalExpenses(userId, yesterdayStart, yesterdayEnd),
      ]);

      const dayTotal = dayExpenses.reduce(
        (sum, e) => sum + e.amount,
        0
      );

      setExpenses(dayExpenses);
      setTotalSpent(dayTotal);
      setTrendPercent(calcTrendPercent(dayTotal, yesterdayTotal));
    } catch (error) {
      console.error("Error fetching daily expenses:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, userId]);

  useEffect(() => {
    fetchDayData();
  }, [fetchDayData]);

  useEffect(() => {
    if (!initialAddOpen) return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has("add")) return;
    url.searchParams.delete("add");
    const query = url.searchParams.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${query ? `?${query}` : ""}${url.hash}`,
    );
  }, [initialAddOpen]);

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
      showSuccessToast("Expense added successfully");
      await fetchDayData();
    } catch (error) {
      console.error("Error adding expense:", error);
      showErrorToast("Failed to add expense");
    }
  };

  const handleUpdateExpense = async (data: ExpenseFormData) => {
    if (!editingExpense?.id) return;
    try {
      await expenseService.updateExpense(editingExpense.id, data);
      showSuccessToast("Expense updated successfully");
      setEditingExpense(null);
      await fetchDayData();
    } catch (error) {
      console.error("Error updating expense:", error);
      showErrorToast("Failed to update expense");
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
    <>
      <div className="min-h-dvh bg-muted md:hidden">
        <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4 sm:max-w-2xl sm:px-6 sm:py-8 sm:pb-6">
          <DailyHeroCard
            selectedDate={selectedDate}
            totalSpent={totalSpent}
            trendPercent={trendPercent}
            isLoading={isLoading}
            canGoNext={canGoNext}
            onPrev={goToPrev}
            onNext={goToNext}
            onGoToToday={goToToday}
          />

          <ExpenseList
            expenses={expenses}
            selectedDate={selectedDate}
            isLoading={isLoading}
            onEdit={(expense) => setEditingExpense(expense)}
            onDelete={(expense) => setDeletingExpense(expense)}
          />
        </div>
      </div>

      <DailyViewDesktop
        selectedDate={selectedDate}
        expenses={expenses}
        totalSpent={totalSpent}
        trendPercent={trendPercent}
        isLoading={isLoading}
        canGoNext={canGoNext}
        onPrev={goToPrev}
        onNext={goToNext}
        onGoToToday={goToToday}
        onAdd={() => setIsAddOpen(true)}
        onEdit={(expense) => setEditingExpense(expense)}
        onDelete={(expense) => setDeletingExpense(expense)}
      />

      {/* Add expense dialog */}
      <AddExpenseDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSubmit={handleAddExpense}
        userId={userId}
        defaultDate={selectedDate}
      />

      {/* Edit expense dialog */}
      <AddExpenseDialog
        open={!!editingExpense}
        onOpenChange={(open) => { if (!open) setEditingExpense(null); }}
        onSubmit={handleUpdateExpense}
        expense={editingExpense}
        userId={userId}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deletingExpense}
        onOpenChange={(open) => { if (!open) setDeletingExpense(null); }}
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
                  &rdquo; will be permanently removed. This cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
