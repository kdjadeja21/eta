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
  ArrowDownWideNarrow,
} from "lucide-react";
import CustomSelect from "@/components/CustomSelect";
import { ExpenseType, formatExpenseType } from "@/lib/types";

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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { exportToExcel, exportToPDF } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
    setTempFilters({});
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

  // Helper to format date range for filename
  const getDateRangeString = () => {
    const from = meta?.dateRange?.from ? new Date(meta.dateRange.from) : null;
    const to = meta?.dateRange?.to ? new Date(meta.dateRange.to) : null;
    if (from && to) {
      return `${from.toISOString().slice(0, 10)}_to_${to
        .toISOString()
        .slice(0, 10)}`;
    } else if (from) {
      return `${from.toISOString().slice(0, 10)}`;
    } else if (to) {
      return `${to.toISOString().slice(0, 10)}`;
    }
    return "all";
  };

  // Download as Excel
  const handleDownloadExcel = () => {
    const dateRangeStr = getDateRangeString();
    exportToExcel({
      data,
      fullName: meta?.fullName || "",
      dateRange: meta?.dateRange || {},
      fileName: `statements_${dateRangeStr}.xlsx`,
    });
  };

  // Download as PDF
  const handleDownloadPDF = () => {
    const dateRangeStr = getDateRangeString();
    exportToPDF({
      data,
      fullName: meta?.fullName || "",
      dateRange: meta?.dateRange || {},
      fileName: `statements_${dateRangeStr}.pdf`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start gap-4 py-4 md:flex-row md:items-center">
        {/* Existing controls */}
        {searchKey && (
          <div className="relative w-full md:max-w-sm">
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
            <div className="flex w-full gap-4 md:w-auto">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
                className={
                  Object.keys(columnFilters).length > 0
                    ? "flex items-center gap-2 cursor-pointer w-2/3 md:w-auto"
                    : "flex items-center gap-2 cursor-pointer w-full md:w-auto"
                }
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
              <Button
                variant="outline"
                onClick={clearFilters}
                className={
                  Object.keys(columnFilters).length > 0
                    ? "flex items-center gap-2 cursor-pointer w-1/3.5 md:w-auto"
                    : "hidden"
                }
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear Filters</span>
              </Button>
            </div>
            <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <SheetContent side="right" className="p-5 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="space-y-4">
                  {filters.map((filter) => (
                    <div key={filter.columnKey} className="w-full">
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {`Filter by ${filter.label}`}
                      </label>
                      <CustomSelect
                        isMulti
                        options={filter.options.map((option) => ({
                          value: option,
                          label:
                            filter.columnKey === "type"
                              ? formatExpenseType(option as ExpenseType)
                              : option,
                        }))}
                        value={(tempFilters[filter.columnKey] || []).map(
                          (value) => ({
                            value,
                            label:
                              filter.columnKey === "type"
                                ? formatExpenseType(value as ExpenseType)
                                : value,
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
                        setIsDialogOpen(false); // Close the sheet
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
              </SheetContent>
            </Sheet>
          </>
        )}
        {/* Download Buttons */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 cursor-pointer w-full md:w-auto md:ml-auto"
            >
              <ArrowDownWideNarrow className="h-4 w-4" />
              <span>Download Statement</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleDownloadExcel}
            >
              Download as Excel
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleDownloadPDF}
            >
              Download as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
