import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
