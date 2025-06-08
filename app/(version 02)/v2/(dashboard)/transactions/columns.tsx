import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";
import { ExpenseType, formatExpenseType } from "@/lib/types";
import { Expense } from "@/lib/expense-service";
import { formatDate, cn } from "@/lib/utils";

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