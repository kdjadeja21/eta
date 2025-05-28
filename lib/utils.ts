import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatExpenseType, ExpenseType } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Custom utility functions to replace date-fns functions

/**
 * Formats a date into a specified string format.
 * @param date - The date to format.
 * @param formatStr - The format string (e.g., 'MMM dd, yyyy').
 */
export function formatDate(date: Date, formatStr: string): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "Invalid Date";
  }

  if (formatStr === "yyyy-MM-dd") {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const options: Intl.DateTimeFormatOptions = {};

  if (formatStr.includes("MMM")) options.month = "short";
  if (formatStr.includes("LLL")) options.month = "long";
  if (formatStr.includes("dd")) options.day = "2-digit";
  if (formatStr.includes("yyyy") || formatStr.includes("y"))
    options.year = "numeric";

  return new Intl.DateTimeFormat("en-US", options).format(date);
}

/**
 * Generates an array of dates within a specified interval.
 * @param start - The start date of the interval.
 * @param end - The end date of the interval.
 */
export function eachDayOfInterval({
  start,
  end,
}: {
  start: Date;
  end: Date;
}): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(start);

  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

/**
 * Checks if two dates are on the same day.
 * @param dateLeft - The first date to compare.
 * @param dateRight - The second date to compare.
 */
export function isSameDay(dateLeft: Date, dateRight: Date): boolean {
  return (
    dateLeft.getFullYear() === dateRight.getFullYear() &&
    dateLeft.getMonth() === dateRight.getMonth() &&
    dateLeft.getDate() === dateRight.getDate()
  );
}

/**
 * Gets the start of the month for a given date.
 * @param date - The date to get the start of the month for.
 */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Extracts unique Paid By options from records.
 * @param records - Array of expense records.
 */
export function getPaidByOptions(
  records: any[]
): { value: string; label: string }[] {
  const uniquePaidBy = Array.from(
    new Set(records.map((record) => record.paidBy))
  );
  return uniquePaidBy.map((paidBy) => ({ value: paidBy, label: paidBy }));
}

/**
 * Extracts unique Category options from records.
 * @param records - Array of expense records.
 */
export function getCategoryOptions(
  records: any[]
): { value: string; label: string }[] {
  const uniqueCategories = Array.from(
    new Set(records.map((record) => record.category))
  );
  return uniqueCategories.map((category) => ({
    value: category,
    label: category,
  }));
}

/**
 * Extracts unique Subcategory options based on a selected category.
 * @param records - Array of expense records.
 * @param selectedCategory - The selected category to filter subcategories.
 */
export function getSubcategoryOptions(
  records: any[],
  selectedCategory: string
): { value: string; label: string }[] {
  const subcategories = records
    .filter((record) => record.category === selectedCategory)
    .map((record) => record.subcategory)
    .filter((subcategory) => subcategory); // Remove undefined or null

  const uniqueSubcategories = Array.from(new Set(subcategories));
  return uniqueSubcategories.map((subcategory) => ({
    value: subcategory,
    label: subcategory,
  }));
}

/**
 * Extracts unique Tag options from records.
 * @param records - Array of expense records.
 */
export function getTagOptions(
  records: any[]
): { value: string; label: string }[] {
  const tags = records.flatMap((record) => record.tags || []);
  const uniqueTags = Array.from(new Set(tags));
  return uniqueTags.map((tag) => ({ value: tag, label: tag }));
}

// Define the export columns and their keys in the desired order
const EXPORT_COLUMNS = [
  { header: "Date", key: "date" },
  { header: "Amount", key: "amount" },
  { header: "Description", key: "description" },
  { header: "Paid By", key: "paidBy" },
  { header: "Category", key: "category" },
  { header: "Sub Category", key: "subcategory" },
  { header: "Tags", key: "tags" },
  { header: "Type", key: "type" },
];

// --- Export Utilities ---

/**
 * Exports data to an Excel file using exceljs.
 * @param data - Array of records (objects)
 * @param fullName - User's full name
 * @param dateRange - { from: Date, to: Date }
 * @param fileName - Optional file name
 */
export async function exportToExcel({ data, fullName, dateRange, fileName = "records.xlsx" }: {
  data: any[];
  fullName: string;
  dateRange: { from?: Date; to?: Date };
  fileName?: string;
}) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Records");

  // Header rows
  worksheet.addRow([`User: ${fullName}`]);
  worksheet.addRow([
    `Date Range: ${dateRange?.from ? formatDate(dateRange.from, "MMM dd, yyyy") : ""} - ${dateRange?.to ? formatDate(dateRange.to, "MMM dd, yyyy") : ""}`
  ]);
  worksheet.addRow([]); // Empty row

  let headerRowIndex = worksheet.lastRow ? worksheet.lastRow.number + 1 : 4;

  if (!data.length) {
    worksheet.addRow(["No data available"]);
  } else {
    // Add column headers in the desired order
    worksheet.addRow(EXPORT_COLUMNS.map(col => col.header));
    // Style header row
    const headerRow = worksheet.getRow(headerRowIndex);
    if (headerRow) {
      headerRow.font = { bold: true };
      headerRow.alignment = { horizontal: 'center' };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD9EAF7' }, // Light blue
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }
    data.forEach((row) => {
      const rowValues = EXPORT_COLUMNS.map(({ key }) => {
        let value = row[key];
        if (key === "date" && value) {
          try {
            value = formatDate(new Date(value), "MMM dd, yyyy");
          } catch {}
        } else if (key === "type" && typeof value === "string") {
          value = formatExpenseType(value as ExpenseType);
        }
        if (Array.isArray(value)) return value.join(", ");
        if (typeof value === "object" && value !== null) return JSON.stringify(value);
        return value ?? "";
      });
      worksheet.addRow(rowValues);
    });
    // Add footer note
    worksheet.addRow([]);
    worksheet.addRow(["This is a computer-generated document."]);
    const footerRow = worksheet.lastRow;
    if (footerRow) {
      footerRow.font = { italic: true, color: { argb: 'FF888888' } };
      footerRow.alignment = { horizontal: 'center' };
      worksheet.mergeCells(`A${footerRow.number}:H${footerRow.number}`);
    }
  }

  // Style header rows
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(2).font = { italic: true };

  // Auto width for columns (guard for undefined)
  if (worksheet.columns) {
    worksheet.columns.forEach((column) => {
      let maxLength = 10;
      column.eachCell && column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = maxLength + 2;
    });
  }

  // Create buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Exports data to a PDF file using jsPDF and autotable.
 * @param data - Array of records (objects)
 * @param fullName - User's full name
 * @param dateRange - { from: Date, to: Date }
 * @param fileName - Optional file name
 */
export function exportToPDF({ data, fullName, dateRange, fileName = "records.pdf" }: {
  data: any[];
  fullName: string;
  dateRange: { from?: Date; to?: Date };
  fileName?: string;
}) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`User: ${fullName}`, 14, 14);
  doc.text(
    `Date Range: ${dateRange?.from ? formatDate(dateRange.from, "MMM dd, yyyy") : ""} - ${dateRange?.to ? formatDate(dateRange.to, "MMM dd, yyyy") : ""}`,
    14,
    22
  );
  if (!data.length) {
    doc.text("No data available", 14, 40);
  } else {
    const headers = EXPORT_COLUMNS.map(col => col.header);
    const rows = data.map((row) =>
      EXPORT_COLUMNS.map(({ key }) => {
        let value = row[key];
        if (key === "date" && value) {
          try {
            value = formatDate(new Date(value), "MMM dd, yyyy");
          } catch {}
        } else if (key === "type" && typeof value === "string") {
          value = formatExpenseType(value as ExpenseType);
        }
        if (Array.isArray(value)) return value.join(", ");
        if (typeof value === "object" && value !== null) return JSON.stringify(value);
        return value ?? "";
      })
    );
    autoTable(doc, {
      startY: 30,
      head: [headers],
      body: rows,
      styles: { fontSize: 10, halign: 'center' },
      headStyles: { fillColor: [22, 160, 133], fontStyle: 'bold', halign: 'center' },
    });
    // Add footer note
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(136, 136, 136);
    doc.text('This file is automatically generated.', doc.internal.pageSize.width / 2, pageHeight - 10, { align: 'center' });
  }
  doc.save(fileName);
}
