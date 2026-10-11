"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Plus, Repeat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { expenseService } from "@/lib/expense-service";
import { getMonthDateRange } from "@/lib/report-month-utils";
import {
  buildFixedVsNewInsight,
  previousMonthKeys,
  type BaselineExpense,
  type ExpenseMatchMode,
  type FixedOrNewItem,
  type FixedVsNewInsight,
} from "@/lib/report-insights";
import { useFormattedCurrency } from "@/lib/currency-utils";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

interface FixedVsNewSectionProps {
  userId: string;
  reportMonth: string;
}

const MODES: { id: ExpenseMatchMode; label: string }[] = [
  { id: "description", label: "Description" },
  { id: "category", label: "Category" },
];

export function FixedVsNewSection({ userId, reportMonth }: FixedVsNewSectionProps) {
  const formatCurrency = useFormattedCurrency();
  const [ref, inView] = useInView<HTMLDivElement>();
  const [mode, setMode] = useState<ExpenseMatchMode>("description");
  const [expenses, setExpenses] = useState<BaselineExpense[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setExpenses(null);
    setError(false);

    const load = async () => {
      try {
        const prior = previousMonthKeys(reportMonth, 3);
        const earliest = prior[0] ?? reportMonth;
        const rows = await expenseService.getExpenses(
          userId,
          monthBound(earliest, "start"),
          monthBound(reportMonth, "end"),
        );
        if (cancelled) return;
        setExpenses(
          rows.map((expense) => ({
            amount: expense.amount,
            description: expense.description,
            category: expense.category,
            month: format(expense.date, "yyyy-MM"),
          })),
        );
      } catch {
        if (!cancelled) {
          setError(true);
          setExpenses([]);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, reportMonth]);

  const insight = useMemo(
    () => (expenses ? buildFixedVsNewInsight(expenses, reportMonth, mode) : null),
    [expenses, reportMonth, mode],
  );

  return (
    <Card ref={ref} className={cn("transition-all duration-500", inView ? "reveal-up" : "opacity-0")}>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Repeat className="h-4 w-4 text-muted-foreground" />
              Fixed vs new
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {mode === "description"
                ? "Matched by description across the last 3 months"
                : "Matched by category across the last 3 months"}
            </p>
          </div>
          <div role="tablist" aria-label="Group expenses by" className="inline-flex rounded-lg border bg-muted/50 p-0.5 self-start">
            {MODES.map((option) => {
              const selected = mode === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setMode(option.id)}
                  className={cn(
                    "cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    selected
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-muted-foreground">Could not load earlier expenses for this comparison.</p>
        )}
        {!error && !insight && <FixedVsNewSkeleton />}
        {!error && insight && (
          <InsightBody insight={insight} formatCurrency={formatCurrency} />
        )}
      </CardContent>
    </Card>
  );
}

function InsightBody({
  insight,
  formatCurrency,
}: {
  insight: FixedVsNewInsight;
  formatCurrency: (amount: number) => string;
}) {
  const total = insight.fixedTotal + insight.addedTotal;
  const fixedPct = total > 0 ? Math.round((insight.fixedTotal / total) * 100) : 0;
  const addedPct = total > 0 ? 100 - fixedPct : 0;
  const comparedLabel = joinMonthLabels(insight.comparedMonthKeys);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        {insight.comparedMonthKeys.length === 0
          ? "No expenses in the previous 3 months, so everything this month counts as new."
          : total <= 0
            ? `No spending this month to compare with ${comparedLabel}.`
            : `${fixedPct}% of this month is spending already seen in ${comparedLabel}. ${addedPct}% is new.`}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryTile
          label="Fixed"
          amount={insight.fixedTotal}
          detail={`${insight.fixed.length} ${insight.fixed.length === 1 ? "item" : "items"}`}
          formatCurrency={formatCurrency}
          tone="fixed"
        />
        <SummaryTile
          label="New this month"
          amount={insight.addedTotal}
          detail={`${insight.added.length} ${insight.added.length === 1 ? "item" : "items"}`}
          formatCurrency={formatCurrency}
          tone="new"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ItemColumn
          title="Fixed expenses"
          empty="Nothing from earlier months showed up again."
          items={insight.fixed}
          comparedMonthKeys={insight.comparedMonthKeys}
          formatCurrency={formatCurrency}
          tone="fixed"
        />
        <ItemColumn
          title="New expenses"
          empty="No new expenses this month."
          items={insight.added}
          comparedMonthKeys={insight.comparedMonthKeys}
          formatCurrency={formatCurrency}
          tone="new"
        />
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  amount,
  detail,
  formatCurrency,
  tone,
}: {
  label: string;
  amount: number;
  detail: string;
  formatCurrency: (amount: number) => string;
  tone: "fixed" | "new";
}) {
  return (
    <div className="rounded-xl border bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-xl font-bold tabular-nums", tone === "new" ? "text-amber-600 dark:text-amber-400" : "text-foreground")}>
        {formatCurrency(amount)}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
    </div>
  );
}

function ItemColumn({
  title,
  empty,
  items,
  comparedMonthKeys,
  formatCurrency,
  tone,
}: {
  title: string;
  empty: string;
  items: FixedOrNewItem[];
  comparedMonthKeys: string[];
  formatCurrency: (amount: number) => string;
  tone: "fixed" | "new";
}) {
  return (
    <div className="rounded-xl border">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        {tone === "fixed" ? (
          <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <Plus className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        )}
        <p className="text-sm font-medium">{title}</p>
      </div>
      {items.length === 0 ? (
        <p className="px-3 py-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="max-h-80 divide-y overflow-y-auto">
          {items.map((item) => (
            <li key={item.key || item.label} className="px-3 py-2.5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium leading-snug">{item.label}</p>
                <p className="shrink-0 text-sm font-semibold tabular-nums">{formatCurrency(item.currentAmount)}</p>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                <ItemMeta
                  item={item}
                  comparedMonthKeys={comparedMonthKeys}
                  formatCurrency={formatCurrency}
                />
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemMeta({
  item,
  comparedMonthKeys,
  formatCurrency,
}: {
  item: FixedOrNewItem;
  comparedMonthKeys: string[];
  formatCurrency: (amount: number) => string;
}) {
  const txn =
    item.transactionCount === 1 ? "1 transaction" : `${item.transactionCount} transactions`;

  if (item.priorMonthCount === 0) return txn;

  const seen =
    comparedMonthKeys.length <= 1
      ? `Also in ${joinMonthLabels(comparedMonthKeys)}`
      : `In ${item.priorMonthCount} of ${comparedMonthKeys.length} months`;
  const usual = item.priorAmount / item.priorMonthCount;
  if (!Number.isFinite(usual) || usual <= 0) return `${seen} · ${txn}`;

  const pct = ((item.currentAmount - usual) / usual) * 100;
  const change =
    Math.abs(pct) < 8
      ? null
      : `${Math.abs(Math.round(pct))}% ${pct > 0 ? "higher" : "lower"}`;

  return (
    <>
      {seen}
      {" · "}
      usually {formatCurrency(usual)}
      {change && (
        <span className={pct > 0 ? "text-red-500" : "text-green-600 dark:text-green-500"}>
          {" · "}
          {change}
        </span>
      )}
    </>
  );
}

function FixedVsNewSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-16 rounded-xl bg-muted animate-pulse" />
        <div className="h-16 rounded-xl bg-muted animate-pulse" />
      </div>
    </div>
  );
}

function monthBound(month: string, edge: "start" | "end"): Date {
  const range = getMonthDateRange(month, new Date(), 0);
  switch (edge) {
    case "start":
      return range.monthStart;
    case "end":
      return range.monthEnd;
    default: {
      const _exhaustive: never = edge;
      return _exhaustive;
    }
  }
}

function joinMonthLabels(monthKeys: string[]): string {
  const labels = monthKeys.map((key) => {
    const [year, monthNum] = key.split("-").map(Number);
    return format(new Date(year, monthNum - 1, 1), "MMMM yyyy");
  });
  if (labels.length <= 1) return labels[0] ?? "earlier months";
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}
