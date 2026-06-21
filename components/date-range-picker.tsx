"use client";
import { CalendarIcon } from "lucide-react";
import { formatDate, startOfMonth } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import {
  subMonths,
  startOfWeek,
  endOfWeek,
  endOfMonth,
  startOfYear,
  endOfYear,
  subYears,
  isSameDay,
} from "date-fns";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  className?: string;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

function isSameDateRange(
  current: DateRange | undefined,
  preset: DateRange
): boolean {
  if (!current?.from || !current?.to || !preset.from || !preset.to) {
    return false;
  }

  return (
    isSameDay(current.from, preset.from) && isSameDay(current.to, preset.to)
  );
}

export function DateRangePicker({
  className,
  dateRange,
  onDateRangeChange,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const today = useMemo(() => new Date(), []);

  const quickRanges = useMemo(
    () => [
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
    ],
    [today]
  );

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover modal open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full sm:w-[300px] justify-start text-left font-normal hover:bg-accent hover:text-accent-foreground",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
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
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[calc(100vw-2rem)] sm:w-auto p-0 pointer-events-auto shadow-lg border-border/50"
          align="start"
        >
          <div className="p-3 border-b border-border/50">
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Quick Select</h4>
            <div className="grid grid-cols-2 gap-2">
              {quickRanges.map((range) => {
                const isActive = isSameDateRange(dateRange, range.range);

                return (
                  <Button
                    key={range.label}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "justify-start font-normal cursor-pointer",
                      !isActive &&
                        "hover:bg-accent hover:text-accent-foreground"
                    )}
                    aria-pressed={isActive}
                    onClick={() => {
                      onDateRangeChange(range.range);
                      setOpen(false);
                    }}
                  >
                    {range.label}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="p-3">
            <Calendar
              allowRange
              value={dateRange}
              onChange={(value) => onDateRangeChange(value as DateRange | undefined)}
              className="p-0 w-full"
              numberOfMonths={1}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
