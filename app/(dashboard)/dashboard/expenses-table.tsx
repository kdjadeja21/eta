"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Expense } from "@/lib/expense-service";
import { format } from "date-fns";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useFormattedCurrency } from "@/lib/currency-utils";
import { expenseService } from "@/lib/expense-service";
import { useUser } from "@clerk/nextjs";

interface ExpensesTableProps {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpensesTable({
  expenses,
  isLoading,
  onEdit,
  onDelete,
}: ExpensesTableProps) {
  const [filters, setFilters] = useState({
    description: "",
    paidBy: "",
    category: "",
    type: "",
  });

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { user } = useUser();
  const userId = user?.id;
  const [fetchedExpenses, setFetchedExpenses] = useState<Expense[]>([]);

  // Fetch expenses dynamically
  useEffect(() => {
    const fetchExpenses = async () => {
      if (userId) {
        const fetchedExpenses = await expenseService.getExpenses(userId);
        setFetchedExpenses(fetchedExpenses);
      }
    };

    fetchExpenses();
  }, [userId]);

  // Get unique values for dropdowns
  const paidByOptions = Array.from(
    new Set(fetchedExpenses.map((e) => e.paidBy))
  );
  const categoryOptions = Array.from(
    new Set(fetchedExpenses.map((e) => e.category))
  );
  const typeOptions = ["need", "want", "not_sure"];

  // Apply filters
  const filteredExpenses = fetchedExpenses.filter((expense) => {
    return (
      expense.description
        .toLowerCase()
        .includes(filters.description.toLowerCase()) &&
      (filters.paidBy === "" || expense.paidBy === filters.paidBy) &&
      (filters.category === "" || expense.category === filters.category) &&
      (filters.type === "" || expense.type === filters.type)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;

            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
              if (i === 4)
                return (
                  <PaginationItem key={i}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
              if (i === 0)
                return (
                  <PaginationItem key={i}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
            } else {
              if (i === 0)
                return (
                  <PaginationItem key={i}>
                    <PaginationLink onClick={() => setCurrentPage(1)}>
                      1
                    </PaginationLink>
                  </PaginationItem>
                );
              if (i === 1)
                return (
                  <PaginationItem key={i}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              if (i === 3)
                return (
                  <PaginationItem key={i}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              if (i === 4)
                return (
                  <PaginationItem key={i}>
                    <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                );
              pageNum = currentPage + i - 2;
            }

            return (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setCurrentPage(pageNum)}
                  isActive={currentPage === pageNum}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

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

  const formattedAmount = useFormattedCurrency();

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="h-24 flex items-center justify-center">
          <p className="text-muted-foreground">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Description
            </label>
            <Input
              placeholder="Filter by description"
              value={filters.description}
              onChange={(e) =>
                handleFilterChange("description", e.target.value)
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Paid By</label>
            <Select
              value={filters.paidBy}
              onValueChange={(value) => handleFilterChange("paidBy", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {paidByOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categoryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Type</label>
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {typeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() +
                      option.slice(1).replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">
                Description
              </TableHead>
              <TableHead className="hidden md:table-cell">Paid By</TableHead>
              <TableHead className="hidden lg:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell">
                Subcategory
              </TableHead>
              <TableHead className="hidden xl:table-cell">Tags</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No expenses found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(expense.date, "MMM dd, yyyy")}</TableCell>
                  <TableCell>{formattedAmount(expense.amount)}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                    {expense.description}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {expense.paidBy}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {expense.category}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {expense.subcategory}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {expense.tags &&
                        expense.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(expense.type)}>
                      {expense.type.charAt(0).toUpperCase() +
                        expense.type.slice(1).replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(expense)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (expense.id) {
                              setDeleteConfirm(expense.id);
                            }
                          }}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {renderPagination()}
      </div>

      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              expense.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  onDelete(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
