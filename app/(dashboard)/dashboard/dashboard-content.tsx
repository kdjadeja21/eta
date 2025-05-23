"use client";

import { useState, useEffect } from "react";
import type { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/date-range-picker";
import { StatsCards } from "./stats-cards";
import { ExpenseChart } from "./expense-chart";
import { ExpensesTable } from "./expenses-table";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { AddExpenseDialog } from "./add-expense-dialog";
import { expenseService, type Expense } from "@/lib/expense-service";
import { startOfMonth, formatDate } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { PencilIcon, TrashIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { uniq } from "lodash";
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
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";

// Extend the TableMeta type to include onEdit and onDelete
interface CustomTableMeta {
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
}

declare module "@tanstack/react-table" {
  interface TableMeta<TData> extends CustomTableMeta {}
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "need":
      return "bg-green-500 hover:bg-green-600";
    case "want":
      return "bg-blue-500 hover:bg-blue-600";
    case "not_sure":
      return "bg-yellow-500 hover:bg-yellow-600";
    default:
      return "";
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
    header: "Paid By",
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
      <Badge className={getTypeColor(row.original.type)}>
        {row.original.type.charAt(0).toUpperCase() +
          row.original.type.slice(1).replace("_", " ")}
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

export function DashboardContent({ userId }: { userId: string }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
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

  const service = expenseService;

  useEffect(() => {
    const fetchExpenses = async () => {
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

  const handleAddExpense = async (expense: Expense) => {
    try {
      const newExpense = await service.addExpense(userId, expense);
      setExpenses((prev) => [newExpense, ...prev]);
    } catch (error) {
      showErrorToast("Error adding expense");
    }
  };

  const handleUpdateExpense = async (id: string, expense: Partial<Expense>) => {
    try {
      await service.updateExpense(id, expense);
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...expense } : e))
      );
    } catch (error) {
      showErrorToast("Error updating expense");
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await service.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      showErrorToast("Error deleting expense");
    }
  };

  const filterOptions = [
    {
      columnKey: "paidBy",
      options: uniq(expenses.map((e) => e.paidBy)).filter(
        (v): v is string => typeof v === "string"
      ),
    },
    {
      columnKey: "category",
      options: uniq(expenses.map((e) => e.category)).filter(
        (v): v is string => typeof v === "string"
      ),
    },
    {
      columnKey: "subcategory",
      options: uniq(expenses.map((e) => e.subcategory)).filter(
        (v): v is string => typeof v === "string"
      ),
    },
    {
      columnKey: "tags",
      options: uniq(expenses.flatMap((e) => e.tags)).filter(
        (v): v is string => typeof v === "string"
      ),
    },
    {
      columnKey: "type",
      options: uniq(expenses.map((e) => e.type)).filter(
        (v): v is "need" | "want" | "not_sure" =>
          ["need", "want", "not_sure"].includes(v)
      ),
    },
  ];

  const filteredExpenses = expenses.filter((expense) => {
    return Object.entries(filters).every(([key, value]) => {
      const field = expense[key as keyof Expense];
      const selectedValues = value.split(",");
      if (Array.isArray(field)) {
        return selectedValues.some((val) => field.includes(val));
      }
      return selectedValues.includes(String(field));
    });
  });

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
  };

  const confirmDeleteExpense = async () => {
    if (!deleteExpenseId) return;

    try {
      await service.deleteExpense(deleteExpenseId);
      setExpenses((prev) => prev.filter((e) => e.id !== deleteExpenseId));
    } catch (error) {
      showErrorToast("Error deleting expense");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteExpenseId(null);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <Button
            className="w-full sm:w-auto cursor-pointer"
            onClick={() => {
              setEditingExpense(null);
              setIsAddExpenseOpen(true);
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
          <Button
            className="w-full sm:w-auto cursor-pointer"
            onClick={() => {
              setIsAddCashOpen(true);
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Cash
          </Button>
          <AddCashDialog
            open={isAddCashOpen}
            onOpenChange={setIsAddCashOpen}
            onCashAdded={() => {
              // Refresh data or perform any necessary updates
              showSuccessToast("Cash added successfully");
            }}
            onClose={() => setIsAddCashOpen(false)}
          />
        </div>
      </div>

      <StatsCards totalExpenses={totalExpenses} onHandCash={onHandCash} />

      <DataTable
        columns={columns}
        data={filteredExpenses}
        searchKey="description"
        pageSize={10}
        filters={filterOptions}
        onFilterChange={setFilters}
        loading={isLoading}
        meta={tableMeta} // Pass the tableMeta object here
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
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteExpense}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
