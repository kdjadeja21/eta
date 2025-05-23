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
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import Select from "react-select";

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

const customStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? "var(--color-bg-hover)"
      : "var(--color-bg)",
    borderColor: state.isFocused
      ? "var(--color-border-focus)"
      : "var(--color-border)",
    color: "var(--color-text)",
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "var(--color-bg)",
    color: "var(--color-text)",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? "var(--color-bg-hover)"
      : "var(--color-bg)",
    color: "var(--color-text)",
  }),
  multiValue: (provided: any) => ({
    ...provided,
    backgroundColor: "var(--color-bg-hover)",
    color: "var(--color-text)",
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: "var(--color-text)",
  }),
  multiValueRemove: (provided: any) => ({
    ...provided,
    color: "var(--color-text)",
    ":hover": {
      backgroundColor: "var(--color-bg-hover)",
      color: "var(--color-text-hover)",
    },
  }),
};

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
          <Input
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        )}
        {filters.length > 0 && (
          <>
            <Button
              variant="outline"
              onClick={clearFilters}
              className={
                Object.keys(columnFilters).length > 0 ? "block" : "hidden"
              } // Show only if filters are applied
            >
              Clear Filters
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="cursor-pointer" variant="outline">
                  Filter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filters</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {filters.map((filter) => (
                    <div key={filter.columnKey} className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {`Filter by ${filter.columnKey}`}
                      </label>
                      <Select
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
                        onChange={(selectedOptions) => {
                          const values = selectedOptions.map(
                            (option) => option.value
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
                      variant="outline"
                      onClick={() => {
                        setTempFilters(columnFilters);
                        setIsDialogOpen(false); // Close the dialog
                      }}
                    >
                      Cancel
                    </Button>
                    <Button variant="default" onClick={applyFilters}>
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
