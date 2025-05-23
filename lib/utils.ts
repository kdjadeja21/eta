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
  const options: Intl.DateTimeFormatOptions = {};

  if (formatStr.includes("MMM")) options.month = "short";
  if (formatStr.includes("dd")) options.day = "2-digit";
  if (formatStr.includes("yyyy")) options.year = "numeric";

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
