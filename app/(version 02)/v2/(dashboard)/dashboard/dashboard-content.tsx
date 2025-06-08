"use client";

import { useState, useEffect, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { StatsCards } from "./stats-cards";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { AddExpenseDialog } from "./add-expense-dialog";
import {
  expenseService,
  type Expense,
  ExpenseFormData,
} from "@/lib/expense-service";
import { startOfMonth, formatDate, cn } from "@/lib/utils";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import AreaChart from "@/components/ui/area-chart";
import { Card } from "@/components/ui/card";
import { BulkUploadDialog } from "./bulk-upload-dialog";
import { ExpensePieChart } from "./widgets/expense-pie-chart";
import { useUser } from "@clerk/nextjs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDateRange } from "@/components/date-range-context";
import { AddCashDialog } from "./add-cash-dialog";

export function DashboardContent({ userId }: { userId: string }) {
  const { dateRange } = useDateRange();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddCashOpen, setIsAddCashOpen] = useState(false);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const service = expenseService;
  const { user } = useUser();

  useEffect(() => {
    const fetchExpenses = async () => {
      setRefreshKey((prev) => prev + 1);
      setIsLoading(true);
      try {
        if (dateRange?.from && dateRange?.to) {
          const data = await service.getExpenses(
            userId,
            dateRange.from,
            dateRange.to
          );
          setExpenses(data);
        } else {
          const data = await service.getExpenses(userId);
          setExpenses(data);
        }
      } catch (error) {
        showErrorToast("Error fetching expenses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [userId, dateRange, service]);

  const handleAddExpense = async (data: ExpenseFormData) => {
    try {
      const newExpense = {
        ...data,
        id: crypto.randomUUID(),
      };
      await service.addExpense(userId, newExpense);
      showSuccessToast("Expense added successfully");
      setExpenses((prev) => [newExpense, ...prev]);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  useEffect(() => {
    const calculateTotalExpenses = () => {
      const total = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      setTotalExpenses(total);
    };

    calculateTotalExpenses();
  }, [expenses]);

  const cashWithdrawals = expenses
    .filter((e) => e.category === "Cash Withdrawal")
    .reduce((sum, e) => sum + e.amount, 0);

  const cashExpenses = expenses
    .filter((e) => e.paidBy === "Cash")
    .reduce((sum, e) => sum + e.amount, 0);

  const onHandCash = cashWithdrawals - cashExpenses;

  // Remove the useEffect for chart data and replace with useMemo
  const chartData = useMemo(() => {
    const groupedData = expenses.reduce((acc, expense) => {
      const date = formatDate(expense.date, "yyyy-MM-dd");
      acc[date] = (acc[date] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(groupedData).map(([name, value]) => ({
      name,
      value,
    }));

    return data.sort((a, b) => a.name.localeCompare(b.name));
  }, [expenses]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex gap-4 w-full sm:w-auto">
            <Button
              className="w-1/2 sm:w-auto cursor-pointer"
              onClick={() => {
                setIsAddExpenseOpen(true);
              }}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
            <Button
              className="w-2/4.5 sm:w-auto cursor-pointer"
              onClick={() => setIsBulkUploadOpen(true)}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Upload Bulk Records
            </Button>
          </div>
          <AddCashDialog
            open={isAddCashOpen}
            onOpenChange={setIsAddCashOpen}
            onCashAdded={() => {
              showSuccessToast("Cash added successfully");
            }}
            onClose={() => setIsAddCashOpen(false)}
          />
        </div>
      </div>

      <StatsCards
        totalExpenses={totalExpenses}
        onHandCash={onHandCash}
        userId={userId}
        dateRange={dateRange}
        refreshKey={refreshKey}
      />

      {/* Mobile View with Accordion */}
      <div className="md:hidden">
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="daily-expenses">
            <AccordionTrigger>
              <div className="flex flex-row items-center justify-between w-full">
                <span className="font-semibold text-lg">Daily Expenses</span>
                <span className="text-xs text-muted-foreground ml-2">
                  tap to show/hide
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <AreaChart data={chartData} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="expense-distribution">
            <AccordionTrigger>
              <div className="flex flex-row items-center justify-between w-full">
                <span className="font-semibold text-lg">
                  Expense Distribution
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  tap to show/hide
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ExpensePieChart
                userId={userId}
                dateRange={dateRange}
                refreshKey={refreshKey}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Desktop View with Grid */}
      <div className="hidden md:grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold m-4">Daily Expenses</h2>
          <AreaChart data={chartData} />
        </Card>

        <ExpensePieChart
          userId={userId}
          dateRange={dateRange}
          refreshKey={refreshKey}
        />
      </div>

      <AddExpenseDialog
        open={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        onSubmit={handleAddExpense}
        userId={userId}
      />

      <BulkUploadDialog
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
        onSubmit={async (data) => {
          try {
            await Promise.all(
              data.map((expense) => service.addExpense(userId, expense))
            );
            showSuccessToast("Bulk records added successfully.");
            setExpenses((prev) => [...data, ...prev]);
            setRefreshKey((prev) => prev + 1);
          } catch (error) {
            console.log("Error adding bulk records:", error);
            showErrorToast("Error adding bulk records.");
          }
        }}
      />
    </div>
  );
}
