import { ColumnDef } from "@tanstack/react-table";

export type SelectFilterOptions = {
  columnKey: string;
  label: string;
  type?: "select";
  options: string[];
};

export type RangeFilterOptions = {
  columnKey: string;
  label: string;
  type: "range";
};

export type FilterOptions = SelectFilterOptions | RangeFilterOptions;

export type RangeFilterValue = {
  min: string;
  max: string;
};

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  searchKey?: string;
  pageSize?: number;
  onEdit?: (row: TData) => void;
  onView?: (row: TData) => void;
  filters?: FilterOptions[];
  onFilterChange?: (filters: Record<string, string>) => void;
};

export type DataTablePaginationProps = {
  table: any;
  pageSizeOptions?: number[];
};

export type DataTableMeta<TData> = {
  onEdit?: (row: TData) => void;
  onDelete?: (id: string) => void;
};
