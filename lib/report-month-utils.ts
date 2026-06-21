import { format, startOfMonth, endOfMonth, endOfDay } from "date-fns";

export function getCurrentMonthKey(date = new Date()): string {
  return format(date, "yyyy-MM");
}

export function isCurrentMonth(month: string, date = new Date()): boolean {
  return month === getCurrentMonthKey(date);
}

/**
 * Returns the UTC start/end timestamps for a given month.
 *
 * @param timezoneOffsetMinutes - The client's `Date.prototype.getTimezoneOffset()` value
 *   (minutes that UTC is ahead of local time; negative for UTC+ zones, e.g. IST = -330).
 *   Passing the client's offset ensures expenses stored at local-midnight are included
 *   even when the server runs in UTC.
 */
export function getMonthDateRange(
  month: string,
  date = new Date(),
  timezoneOffsetMinutes = 0,
) {
  const [year, monthNum] = month.split("-").map(Number);
  const refDate = new Date(year, monthNum - 1, 1);

  // Shift the UTC boundaries by the client's timezone offset so that
  // "local midnight" expense timestamps are captured correctly.
  const tzOffsetMs = timezoneOffsetMinutes * 60 * 1000;

  const monthStart = new Date(startOfMonth(refDate).getTime() + tzOffsetMs);
  const monthEnd = isCurrentMonth(month, date)
    ? new Date(endOfDay(date).getTime() + tzOffsetMs)
    : new Date(endOfMonth(refDate).getTime() + tzOffsetMs);

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
