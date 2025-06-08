"use client";

import { useState, useEffect, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/date-range-picker";
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
import { DataTable } from "@/components/ui/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { PencilIcon, TrashIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { set, uniq } from "lodash";
import { AddCashDialog } from "./add-cash-dialog";
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
}

declare module "@tanstack/react-table" {
  interface TableMeta<TData> extends CustomTableMeta {}
}

const getTypeColor = (type: ExpenseType) => {
  switch (type) {
    case ExpenseType.Need:
      return "bg-green-500 hover:bg-green-600";
    case ExpenseType.Want:
      return "bg-blue-500 hover:bg-blue-600";
    case ExpenseType.NotSure:
      return "bg-yellow-500 hover:bg-yellow-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

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
    cell: ({ row }: { row: { original: Expense } }) =>
      row.original.amount.toFixed(2),
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
      <Badge
        className={cn(
          "text-white dark:text-black",
          getTypeColor(row.original.type)
        )}
      >
        {formatExpenseType(row.original.type)}
      </Badge>
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
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddCashOpen, setIsAddCashOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const service = expenseService;
  const { user } = useUser();
  const fullName = user?.fullName || "";

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
        id: crypto.randomUUID(), // Add a temporary ID
      };
      await service.addExpense(userId, newExpense);
      showSuccessToast("Expense added successfully");
      setExpenses((prev) => [newExpense, ...prev]);
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
      await Promise.all(
        data.map((expense) => service.addExpense(userId, expense))
      );
      showSuccessToast("Bulk records added successfully.");
      setExpenses((prev) => [...data, ...prev]);
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

      setRefreshKey((prev) => prev + 1);
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
      setDeleteExpenseId(id); // Set the ID of the expense to delete
      setIsDeleteDialogOpen(true); // Open the delete confirmation dialog
    },
    fullName,
    dateRange,
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
      // Clear the loading toast
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
    }
  };

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
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <DateRangePicker            
            className="cursor-pointer w-full sm:w-auto"
          />
          <div className="flex gap-4 w-full sm:w-auto">
            <Button
              className="w-1/2 sm:w-auto cursor-pointer"
              onClick={() => {
                setEditingExpense(null);
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
