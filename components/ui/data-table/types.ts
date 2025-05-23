import { ColumnDef } from "@tanstack/react-table";

export type FilterOptions = {
  columnKey: string;
  options: string[];
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
