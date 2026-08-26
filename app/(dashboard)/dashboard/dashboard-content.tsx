"use client";

import { useState, useEffect, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/date-range-picker";
import { StatsCards } from "./stats-cards";
import { Button } from "@/components/ui/button";
import { AddExpenseDialog } from "./add-expense-dialog";
import {
  expenseService,
  type Expense,
  ExpenseFormData,
} from "@/lib/expense-service";
import { formatDate, cn, exportToExcel, exportToPDF } from "@/lib/utils";
import {
  getDefaultDateRange,
  loadStoredDateRange,
  storeDateRange,
} from "@/lib/dashboard-date-range-storage";
import { DataTable } from "@/components/ui/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { PencilIcon, TrashIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { set, uniq } from "lodash";
import {
  AlertDialog,
  AlertDialogTrigger,
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
  showWarningToast,
  showInfoToast,
  showLoadingToast,
} from "@/components/ui/toast";
import { toast } from "sonner";
import AreaChart from "@/components/ui/area-chart";
import { Card } from "@/components/ui/card";
import { BulkUploadDialog } from "./bulk-upload-dialog";
import { ExpensePieChart } from "./widgets/expense-pie-chart";
import { ExpenseType, formatExpenseType } from "@/lib/types";
import { useUser } from "@clerk/nextjs";
import { useFormattedCurrency } from "@/lib/currency-utils";
import {
  useRegisterAddExpense,
} from "@/components/app-shell/add-expense-context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Extend the TableMeta type to include onEdit and onDelete
interface CustomTableMeta {
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  fullName: string;
  dateRange: DateRange;
  formatCurrency?: (amount: number) => string;
}

declare module "@tanstack/react-table" {
  interface TableMeta<TData> extends CustomTableMeta {}
}

const getTypeLabel = (type: ExpenseType) => formatExpenseType(type);

export type ExpenseColumn = ColumnDef<Expense>;

export const columns: ExpenseColumn[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }: { row: { original: Expense } }) =>
      formatDate(row.original.date, "MMM dd, yyyy"),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row, table }: { row: { original: Expense }; table: any }) =>
      table.options.meta?.formatCurrency?.(row.original.amount) ??
      String(row.original.amount),
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "paidBy",
    header: "Payment Method",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "subcategory",
    header: "Sub Category",
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }: { row: { original: Expense } }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.tags &&
          row.original.tags.map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }: { row: { original: Expense } }) => (
      <span className="text-ui text-muted-foreground">
        {getTypeLabel(row.original.type)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }: { row: { original: Expense }; table: any }) => (
      <div className="flex gap-2">
        <Button
          className="cursor-pointer"
          size="icon"
          variant="ghost"
          onClick={() => table.options.meta?.onEdit?.(row.original)}
          aria-label="Edit"
        >
          <PencilIcon className="w-4 h-4" />
        </Button>
        <Button
          className="cursor-pointer"
          size="icon"
          variant="ghost"
          onClick={() => table.options.meta?.onDelete?.(row.original.id)}
          aria-label="Delete"
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

const isValidType = (v: string): v is ExpenseType =>
  Object.values(ExpenseType).includes(v as ExpenseType);

export function DashboardContent({ userId }: { userId: string }) {
  const formatCurrency = useFormattedCurrency();
  const [dateRange, setDateRange] = useState<DateRange>(
    () => loadStoredDateRange(userId) ?? getDefaultDateRange()
  );
  const [isDateRangeReady] = useState(true);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [bulkDeleteExpenseIds, setBulkDeleteExpenseIds] = useState<string[]>(
    []
  );
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [bulkDeleteResetKey, setBulkDeleteResetKey] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const service = expenseService;
  const { user } = useUser();
  const fullName = user?.fullName || "";

  const openAddExpense = () => {
    setEditingExpense(null);
    setIsAddExpenseOpen(true);
  };

  useRegisterAddExpense(openAddExpense);

  useEffect(() => {
    if (!isDateRangeReady) {
      return;
    }

    storeDateRange(userId, dateRange);
  }, [userId, dateRange, isDateRangeReady]);

  useEffect(() => {
    if (!isDateRangeReady) {
      return;
    }

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
  }, [userId, dateRange, service, isDateRangeReady]);

  const handleAddExpense = async (data: ExpenseFormData) => {
    try {
      const savedExpense = await service.addExpense(userId, data);
      showSuccessToast("Expense added successfully");
      const isInRange =
        !dateRange.from ||
        !dateRange.to ||
        (savedExpense.date >= dateRange.from &&
          savedExpense.date <= dateRange.to);
      if (isInRange) {
        setExpenses((prev) => [savedExpense, ...prev]);
      }
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

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

  const handleBulkUpload = async (data: any[]) => {
    const loadingToast = showLoadingToast("Creating bulk records...", {
      description: `Adding ${data.length} records to your expenses`,
    });

    try {
      const savedExpenses = await Promise.all(
        data.map((expense) => service.addExpense(userId, expense))
      );
      showSuccessToast("Bulk records added successfully.");
      const inRangeExpenses = savedExpenses.filter((expense) => {
        if (!dateRange.from || !dateRange.to) return true;
        return (
          expense.date >= dateRange.from && expense.date <= dateRange.to
        );
      });
      setExpenses((prev) => [...inRangeExpenses, ...prev]);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.log("Error adding bulk records:", error);
      showErrorToast("Error adding bulk records.");
    } finally {
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
    }
  };

  const amountBounds = useMemo(() => {
    if (expenses.length === 0) {
      return { min: 0, max: 0 };
    }

    const amounts = expenses.map((expense) => expense.amount);
    return {
      min: Math.min(...amounts),
      max: Math.max(...amounts),
    };
  }, [expenses]);

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
    {
      columnKey: "amount",
      label: "Amount Range",
      type: "range" as const,
      rangeMin: amountBounds.min,
      rangeMax: amountBounds.max,
    },
  ];

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (key === "amount") {
          const [minValue, maxValue] = value.split(",");
          const min = minValue ? Number(minValue) : undefined;
          const max = maxValue ? Number(maxValue) : undefined;

          if (min !== undefined && !Number.isNaN(min) && expense.amount < min) {
            return false;
          }

          if (max !== undefined && !Number.isNaN(max) && expense.amount > max) {
            return false;
          }

          return true;
        }

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

  const handleExportExcel = () => {
    const from = dateRange?.from;
    const to = dateRange?.to;
    const dateRangeStr =
      from && to
        ? `${from.toISOString().slice(0, 10)}_to_${to.toISOString().slice(0, 10)}`
        : "all";
    exportToExcel({
      data: filteredExpenses,
      fullName,
      dateRange: dateRange ?? {},
      fileName: `statements_${dateRangeStr}.xlsx`,
      formatCurrency,
    });
  };

  const handleExportPdf = () => {
    const from = dateRange?.from;
    const to = dateRange?.to;
    const dateRangeStr =
      from && to
        ? `${from.toISOString().slice(0, 10)}_to_${to.toISOString().slice(0, 10)}`
        : "all";
    exportToPDF({
      data: filteredExpenses,
      fullName,
      dateRange: dateRange ?? {},
      fileName: `statements_${dateRangeStr}.pdf`,
      formatCurrency,
    });
  };

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses]
  );

  const cashWithdrawals = expenses
    .filter((e) => e.category === "Cash Withdrawal")
    .reduce((sum, e) => sum + e.amount, 0);

  const cashExpenses = expenses
    .filter((e) => e.paidBy === "Cash")
    .reduce((sum, e) => sum + e.amount, 0);

  const onHandCash = cashWithdrawals - cashExpenses;

  // Define meta for table options
  const tableMeta = {
    onEdit: (expense: Expense) => {
      setEditingExpense(expense); // Set the selected expense for editing
      setIsAddExpenseOpen(true); // Open the AddExpenseDialog
    },
    onDelete: (id: string) => {
      setBulkDeleteExpenseIds([]);
      setDeleteExpenseId(id); // Set the ID of the expense to delete
      setIsDeleteDialogOpen(true); // Open the delete confirmation dialog
    },
    fullName,
    dateRange,
    formatCurrency,
  };

  const pendingDeleteIds =
    bulkDeleteExpenseIds.length > 0
      ? bulkDeleteExpenseIds
      : deleteExpenseId
      ? [deleteExpenseId]
      : [];

  const isBulkDelete = bulkDeleteExpenseIds.length > 0;
  const pendingDeleteCount = pendingDeleteIds.length;

  const confirmDeleteExpense = async () => {
    if (pendingDeleteIds.length === 0) return;
    setIsDeleting(true);

    const loadingToast = showLoadingToast(
      isBulkDelete ? "Deleting expenses..." : "Deleting expense...",
      {
        description:
          pendingDeleteCount === 1
            ? "Please wait while we delete the record"
            : `Please wait while we delete ${pendingDeleteCount} records`,
      }
    );

    const idsToDelete = [...pendingDeleteIds];

    try {
      if (idsToDelete.length === 1 && !isBulkDelete) {
        await service.deleteExpense(idsToDelete[0]);
      } else {
        await service.deleteExpenses(idsToDelete);
      }

      showDeleteToast(
        idsToDelete.length === 1
          ? "Expense Record deleted successfully"
          : `${idsToDelete.length} expense records deleted successfully`
      );
      setExpenses((prev) => prev.filter((e) => !idsToDelete.includes(e.id)));
      setRefreshKey((prev) => prev + 1);
      if (isBulkDelete) {
        setBulkDeleteResetKey((prev) => prev + 1);
      }
    } catch (error) {
      showErrorToast(
        idsToDelete.length === 1
          ? "Error deleting expense"
          : "Error deleting selected expenses"
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeleteExpenseId(null);
      setBulkDeleteExpenseIds([]);
      // Clear the loading toast
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
    }
  };

  const handleBulkDeleteRequest = (selectedExpenses: Expense[]) => {
    if (selectedExpenses.length === 0) {
      return;
    }

    setDeleteExpenseId(null);
    setBulkDeleteExpenseIds(selectedExpenses.map((expense) => expense.id));
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (isDeleting) {
      return;
    }

    setIsDeleteDialogOpen(open);

    if (!open) {
      setDeleteExpenseId(null);
      setBulkDeleteExpenseIds([]);
    }
  };

  const deleteDialogTitle = isBulkDelete
    ? "Confirm Bulk Deletion"
    : "Confirm Deletion";
  const deleteDialogDescription =
    pendingDeleteCount > 1
      ? `Are you sure you want to delete these ${pendingDeleteCount} expenses? This action cannot be undone.`
      : "Are you sure you want to delete this expense? This action cannot be undone.";
  const deleteButtonLabel = isDeleting
    ? pendingDeleteCount > 1
      ? "Deleting..."
      : "Deleting..."
    : pendingDeleteCount > 1
    ? `Delete ${pendingDeleteCount} expenses`
    : "Delete";

  // Remove the useEffect for chart data and replace with useMemo
  const chartData = useMemo(() => {
    const groupedData = filteredExpenses.reduce((acc, expense) => {
      const date = formatDate(expense.date, "yyyy-MM-dd");
      acc[date] = (acc[date] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(groupedData).map(([name, value]) => ({
      name,
      value,
    }));

    return data.sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredExpenses]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-8 md:py-10">
      <header className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-title">Review</h1>
          <p className="mt-1 text-meta">Period totals, charts, and ledger</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={(range) => range && setDateRange(range)}
            className="w-full sm:w-auto"
          />
          <Button onClick={openAddExpense} className="gap-2" aria-keyshortcuts="a">
            Add
            <kbd className="ml-0.5 hidden rounded border border-primary-foreground/30 px-1.5 py-0.5 text-[10px] font-normal lg:inline">
              A
            </kbd>
          </Button>
          <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
            Upload
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            Export Excel
          </Button>
          <Button variant="outline" onClick={handleExportPdf}>
            Export PDF
          </Button>
        </div>
      </header>

      <StatsCards
        totalExpenses={totalExpenses}
        onHandCash={onHandCash}
        expenses={expenses}
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
      <div className="hidden gap-4 md:grid md:grid-cols-2">
        <Card className="rounded-md border-border p-4 shadow-none">
          <h2 className="text-section mb-4">Daily spend</h2>
          <AreaChart data={chartData} />
        </Card>

        <ExpensePieChart
          userId={userId}
          dateRange={dateRange}
          refreshKey={refreshKey}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredExpenses}
        searchKey="description"
        pageSize={10}
        filters={filterOptions}
        onFilterChange={setFilters}
        onBulkDelete={handleBulkDeleteRequest}
        bulkDeleteResetKey={bulkDeleteResetKey}
        loading={isLoading}
        meta={tableMeta}
        hideExportControls
      />

      <AddExpenseDialog
        open={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        onSubmit={async (data) => {
          if (editingExpense) {
            await handleUpdateExpense(editingExpense.id!, data);
          } else {
            await handleAddExpense(data);
          }
        }}
        expense={editingExpense}
        userId={userId}
      />

      <BulkUploadDialog
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
        onSubmit={handleBulkUpload}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteDialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialogDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => handleDeleteDialogOpenChange(false)}
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
              {deleteButtonLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
