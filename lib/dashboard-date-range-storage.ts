import { isSameDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { startOfMonth } from "@/lib/utils";

const STORAGE_KEY_PREFIX = "dashboard-date-range";

function getStorageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}:${userId}`;
}

export function getDefaultDateRange(now = new Date()): DateRange {
  return {
    from: startOfMonth(now),
    to: now,
  };
}

export function isDefaultDateRange(
  dateRange: DateRange | undefined,
  now = new Date()
): boolean {
  const defaults = getDefaultDateRange(now);
  if (!dateRange?.from || !dateRange.to || !defaults.from || !defaults.to) {
    return false;
  }

  return (
    isSameDay(dateRange.from, defaults.from) &&
    isSameDay(dateRange.to, defaults.to)
  );
}

export function loadStoredDateRange(userId: string): DateRange | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { from?: string; to?: string };
    if (!parsed.from || !parsed.to) {
      return null;
    }

    const from = new Date(parsed.from);
    const to = new Date(parsed.to);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
      return null;
    }

    return { from, to };
  } catch {
    return null;
  }
}

export function clearStoredDateRange(userId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(getStorageKey(userId));
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
}

export function storeDateRange(userId: string, dateRange: DateRange): void {
  if (typeof window === "undefined" || !dateRange.from || !dateRange.to) {
    return;
  }

  try {
    localStorage.setItem(
      getStorageKey(userId),
      JSON.stringify({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      })
    );
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
}
