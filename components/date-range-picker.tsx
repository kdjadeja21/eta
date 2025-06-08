"use client";
import { CalendarIcon } from "lucide-react";
import { formatDate, startOfMonth } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { addDays, subMonths, startOfWeek, endOfWeek, endOfMonth, startOfYear, endOfYear, subYears } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDateRange } from "./date-range-context";

interface DateRangePickerProps {
  className?: string;
}

export function DateRangePicker({
  className,
}: DateRangePickerProps) {
  const { dateRange, setDateRange } = useDateRange();
  const today = new Date();

  const quickRanges = [
    {
      label: "This Week",
      range: {
        from: startOfWeek(today),
        to: endOfWeek(today),
      },
    },
    {
      label: "This Month",
      range: {
        from: startOfMonth(today),
        to: today,
      },
    },
    {
      label: "Last Month",
      range: {
        from: startOfMonth(subMonths(today, 1)),
        to: endOfMonth(subMonths(today, 1)),
      },
    },
    {
      label: "This Year",
      range: {
        from: startOfYear(today),
        to: endOfYear(today),
      },
    },
    {
      label: "Last Year",
      range: {
        from: startOfYear(subYears(today, 1)),
        to: endOfYear(subYears(today, 1)),
      },
    },
  ];

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover modal>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full sm:w-[300px] justify-start text-left font-normal hover:bg-accent hover:text-accent-foreground",
              !dateRange && "text-muted-foreground",
              "sm:px-4 px-2"
            )}
          >
            <CalendarIcon className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {formatDate(dateRange.from, "LLL dd, y")} -{" "}
                    {formatDate(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  formatDate(dateRange.from, "LLL dd, y")
                )
              ) : (
                "Pick a date range"
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[calc(100vw-2rem)] sm:w-auto p-0 pointer-events-auto shadow-lg border-border/50"
          align="start"
        >
          <div className="p-3 border-b border-border/50">
            <div className="sm:hidden mb-3">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Current Range</h4>
              <p className="text-sm">
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {formatDate(dateRange.from, "LLL dd, y")} -{" "}
                      {formatDate(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    formatDate(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  "No date range selected"
                )}
              </p>
            </div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Quick Select</h4>
            <div className="grid grid-cols-2 gap-2">
              {quickRanges.map((range) => (
                <Button
                  key={range.label}
                  variant="outline"
                  size="sm"
                  className="justify-start font-normal hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  onClick={() => setDateRange(range.range)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="p-3">
            <Calendar
              allowRange
              value={dateRange}
              defaultMonth={dateRange?.from || today}
              onChange={(value) => {
                if (value && 'from' in value) {
                  setDateRange(value as DateRange);
                }
              }}
              className="p-0 w-full"
              numberOfMonths={1}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
