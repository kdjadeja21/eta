import { format, startOfMonth, endOfMonth, endOfDay } from "date-fns";

export function getCurrentMonthKey(date = new Date()): string {
  return format(date, "yyyy-MM");
}

export function isCurrentMonth(month: string, date = new Date()): boolean {
  return month === getCurrentMonthKey(date);
}

export function getMonthDateRange(month: string, date = new Date()) {
  const [year, monthNum] = month.split("-").map(Number);
  const refDate = new Date(year, monthNum - 1, 1);
  const monthStart = startOfMonth(refDate);
  const monthEnd = isCurrentMonth(month, date)
    ? endOfDay(date)
    : endOfMonth(refDate);
  const monthLabel = isCurrentMonth(month, date)
    ? `${format(refDate, "MMMM yyyy")} (In Progress)`
    : format(refDate, "MMMM yyyy");

  return { monthStart, monthEnd, monthLabel, refDate };
}

export function buildReportMonthOptions(count = 12, date = new Date()) {
  const options: { value: string; label: string }[] = [];

  // Start at i = 1 to exclude the in-progress current month
  for (let i = 1; i <= count; i++) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    options.push({
      value: format(d, "yyyy-MM"),
      label: format(d, "MMMM yyyy"),
    });
  }

  return options;
}
