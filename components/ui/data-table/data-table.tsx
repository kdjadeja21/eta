"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  X,
  Filter,
  Trash2,
} from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableProps } from "./types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DataTable<TData>({
  columns,
  data,
  searchKey,
  pageSize = 10,
  onEdit,
  onView,
  filters = [],
  onFilterChange,
  loading = false, // New prop for loading state
  meta, // Add meta property
}: DataTableProps<TData> & { loading?: boolean; meta?: any }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<
    Record<string, string[]>
  >({});
  const [tempFilters, setTempFilters] = React.useState<
    Record<string, string[]>
  >({}); // Temporary filters for dialog
  const [isDialogOpen, setIsDialogOpen] = React.useState(false); // State to manage dialog open/close

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const handleFilterChange = (columnKey: string, values: string[]) => {
    setTempFilters((prev) => ({ ...prev, [columnKey]: values }));
  };

  const clearFilters = () => {
    setColumnFilters({});
    onFilterChange?.({});
  };

  const applyFilters = () => {
    setColumnFilters(tempFilters);
    onFilterChange?.(
      Object.fromEntries(
        Object.entries(tempFilters).map(([key, val]) => [key, val.join(",")])
      )
    );
    setIsDialogOpen(false); // Close the dialog
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 py-4">
        {searchKey && (
          <div className="relative max-w-sm">
            <Input
              placeholder="Search..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pr-8"
            />
            {globalFilter && (
              <X
                className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={() => setGlobalFilter("")}
              />
            )}
          </div>
        )}
        {filters.length > 0 && (
          <>
            <Button
              variant="outline"
              onClick={clearFilters}
              className={
                Object.keys(columnFilters).length > 0
                  ? "flex items-center gap-2 cursor-pointer"
                  : "hidden"
              }
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Filters</span>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="cursor-pointer" variant="outline">
                  <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] sm:max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Filters</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {filters.map((filter) => (
                    <div key={filter.columnKey} className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {`Filter by ${filter.columnKey}`}
                      </label>
                      <CustomSelect
                        isMulti
                        options={filter.options.map((option) => ({
                          value: option,
                          label: option,
                        }))}
                        value={(tempFilters[filter.columnKey] || []).map(
                          (value) => ({
                            value,
                            label: value,
                          })
                        )}
                        onChange={(selectedOptions: any[]) => {
                          const values = selectedOptions.map(
                            (option: any) => option.value
                          );
                          handleFilterChange(filter.columnKey, values);
                        }}
                        className="basic-multi-select"
                        classNamePrefix="select"
                      />
                    </div>
                  ))}
                  <div className="flex justify-end gap-4">
                    <Button
                      className="cursor-pointer"
                      variant="outline"
                      onClick={() => {
                        setTempFilters(columnFilters);
                        setIsDialogOpen(false); // Close the dialog
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="cursor-pointer"
                      variant="default"
                      onClick={applyFilters}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort();
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        isSortable && "cursor-pointer select-none",
                        "relative"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {isSortable && (
                          <div className="w-4 h-4">
                            {header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronsUpDown className="h-4 w-4 opacity-50" />
                            )}
                          </div>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        {
                          ...cell.getContext(),
                          table: {
                            ...cell.getContext().table,
                            options: {
                              ...cell.getContext().table.options,
                              meta,
                            },
                          },
                        } // Pass meta to cell context
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
