"use client";

import { useState, useEffect, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { DataTable } from "@/components/ui/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { PencilIcon, TrashIcon, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { uniq } from "lodash";
import { useUser } from "@clerk/nextjs";
import { useDateRange } from "@/components/date-range-context";
import { expenseService, type Expense } from "@/lib/expense-service";
import { formatDate, cn } from "@/lib/utils";
import { ExpenseType, formatExpenseType } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  showSuccessToast,
  showErrorToast,
  showDeleteToast,
  showLoadingToast,
} from "@/components/ui/toast";
import { toast } from "sonner";
import { AddExpenseDialog } from "../dashboard/add-expense-dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CountUp from "@/components/count-up";
import { useFormattedCurrency } from "@/lib/currency-utils";
import { columns } from "./columns";

// Extend the TableMeta type to include onEdit and onDelete
interface CustomTableMeta {
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  fullName: string;
  dateRange: DateRange;
}

declare module "@tanstack/react-table" {
  interface TableMeta<TData> extends CustomTableMeta {}
}

const isValidType = (v: string): v is ExpenseType =>
  Object.values(ExpenseType).includes(v as ExpenseType);

export default function TransactionsPage() {
  const { dateRange } = useDateRange();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const service = expenseService;
  const { user } = useUser();
  const fullName = user?.fullName || "";

  const formattedAmount = useFormattedCurrency();

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        const field = expense[key as keyof Expense];
        const selectedValues = value.split(",");
        if (Array.isArray(field)) {
          return selectedValues.some((val) => field.includes(val));
        }
        return selectedValues.includes(String(field));
      });

      const matchesSearch = searchQuery
        ? expense.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      return matchesFilters && matchesSearch;
    });
  }, [expenses, filters, searchQuery]);

  useEffect(() => {
    const calculateTotalExpenses = () => {
      const total = filteredExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      setTotalExpenses(total);
    };

    calculateTotalExpenses();
  }, [filteredExpenses]);

  const cashWithdrawals = filteredExpenses
    .filter((e) => e.category === "Cash Withdrawal")
    .reduce((sum, e) => sum + e.amount, 0);

  const cashExpenses = filteredExpenses
    .filter((e) => e.paidBy === "Cash")
    .reduce((sum, e) => sum + e.amount, 0);

  const onHandCash = cashWithdrawals - cashExpenses;

  useEffect(() => {
    const fetchExpenses = async () => {
      setRefreshKey((prev) => prev + 1);
      setIsLoading(true);
      try {
        if (dateRange?.from && dateRange?.to) {
          const data = await service.getExpenses(
            user?.id || "",
            dateRange.from,
            dateRange.to
          );
          setExpenses(data);
        } else {
          const data = await service.getExpenses(user?.id || "");
          setExpenses(data);
        }
      } catch (error) {
        showErrorToast("Error fetching expenses");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchExpenses();
    }
  }, [user?.id, dateRange, service]);

  const handleUpdateExpense = async (id: string, expense: Partial<Expense>) => {
    try {
      await service.updateExpense(id, expense);
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...expense } : e))
      );
      showSuccessToast("Expense updated successfully");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error updating expense:", error);
      showErrorToast("Error updating expense");
    }
  };

  const confirmDeleteExpense = async () => {
    if (!deleteExpenseId) return;
    setIsDeleting(true);

    const loadingToast = showLoadingToast("Deleting expense...", {
      description: "Please wait while we delete the record",
    });

    try {
      await service.deleteExpense(deleteExpenseId);
      showDeleteToast("Expense Record deleted successfully");
      setExpenses((prev) => prev.filter((e) => e.id !== deleteExpenseId));
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      showErrorToast("Error deleting expense");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeleteExpenseId(null);
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
    }
  };

  const filterOptions = [
    {
      columnKey: "paidBy",
      label: "Payment Method",
      options: uniq(expenses.map((e) => e.paidBy)).filter(
        (v): v is string => typeof v === "string"
      ),
    },
    {
      columnKey: "category",
      label: "Category",
      options: uniq(expenses.map((e) => e.category)).filter(
        (v): v is string => typeof v === "string"
      ),
    },
    {
      columnKey: "subcategory",
      label: "Sub Category",
      options: uniq(expenses.map((e) => e.subcategory)).filter(
        (v): v is string => typeof v === "string"
      ),
    },
    {
      columnKey: "tags",
      label: "Tags",
      options: uniq(expenses.flatMap((e) => e.tags)).filter(
        (v): v is string => typeof v === "string"
      ),
    },
    {
      columnKey: "type",
      label: "Type",
      options: uniq(expenses.map((e) => e.type)).filter((v): v is ExpenseType =>
        isValidType(v)
      ),
    },
  ];

  // Define meta for table options
  const tableMeta = {
    onEdit: (expense: Expense) => {
      setEditingExpense(expense);
      setIsAddExpenseOpen(true);
    },
    onDelete: (id: string) => {
      setDeleteExpenseId(id);
      setIsDeleteDialogOpen(true);
    },
    fullName,
    dateRange,
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <div className="flex gap-4">
          <Button
            className="cursor-pointer"
            onClick={() => {
              setEditingExpense(null);
              setIsAddExpenseOpen(true);
            }}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formattedAmount(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              For the selected date range
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formattedAmount(
                dateRange?.from && dateRange?.to
                  ? totalExpenses /
                    Math.max(
                      1,
                      Math.ceil(
                        (dateRange.to.getTime() - dateRange.from.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    )
                  : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Average per day for the selected period
            </p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={filteredExpenses}
        searchKey="description"
        pageSize={10}
        filters={filterOptions}
        onFilterChange={setFilters}
        loading={isLoading}
        meta={tableMeta}
      />

      <AddExpenseDialog
        open={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        onSubmit={async (data) => {
          if (editingExpense) {
            await handleUpdateExpense(editingExpense.id!, data);
          }
        }}
        expense={editingExpense}
        userId={user?.id || ""}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              variant="destructive"
              onClick={confirmDeleteExpense}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 