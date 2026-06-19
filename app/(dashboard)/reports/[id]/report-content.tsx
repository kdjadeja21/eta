"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, CreditCard, Lightbulb, Sparkles, TrendingUp, BarChart3, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { reportService, type Report } from "@/lib/report-service";
import { useFormattedCurrency } from "@/lib/currency-utils";
import { useInView } from "@/hooks/use-in-view";
import CountUp from "@/components/count-up";
import {
  buildDayGrid,
  deriveHighlights,
  needsWantsVerdict,
  compareReports,
  weekdayBreakdown,
  type MoMComparison,
} from "@/lib/report-insights";
import { ReportHero } from "./report-hero";
import { InsightHighlights } from "./insight-highlights";
import { SpendingCalendar } from "./spending-calendar";
import { NeedsWantsGauge } from "./needs-wants-gauge";
import { CategoryBreakdownChart } from "./category-breakdown";
import { ComparisonSection } from "./comparison-section";
import { DownloadPdfButton } from "./download-pdf-button";
import { cn } from "@/lib/utils";

const CHART_COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8",
  "#82CA9D", "#FFC658", "#FF6B6B", "#4ECDC4", "#45B7D1",
];

interface ReportContentProps {
  reportId: string;
  userId: string;
}

export function ReportContent({ reportId, userId }: ReportContentProps) {
  const formatCurrency = useFormattedCurrency();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [prevReport, setPrevReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await reportService.getReport(reportId);
        if (!r || r.userId !== userId) {
          setError("Report not found.");
          return;
        }
        setReport(r);

        // Best-effort load of previous month
        const [y, m] = r.month.split("-").map(Number);
        const prevDate = new Date(y, m - 2, 1);
        const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
        try {
          const prev = await reportService.getReportByMonth(userId, prevMonth);
          if (prev) setPrevReport(prev);
        } catch {
          // silently ignore — previous report is optional
        }
      } catch {
        setError("Failed to load report.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [reportId, userId]);

  if (isLoading) return <ReportSkeleton />;
  if (error || !report)
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Link href="/reports">
          <Button variant="ghost" size="sm" className="gap-2 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Button>
        </Link>
        <div className="text-muted-foreground">{error ?? "Report not found."}</div>
      </div>
    );

  const { summary } = report;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await reportService.deleteReport(report.id);
      router.push("/reports");
    } catch {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Derive everything client-side — no extra Firestore calls
  const comparison: MoMComparison | null = prevReport
    ? compareReports(report, prevReport)
    : null;
  const highlights = deriveHighlights(summary, report.monthLabel);
  const verdict = needsWantsVerdict(summary.byType);
  const dayGrid = buildDayGrid(report.month, summary.dailyTotals);
  const weekdays = weekdayBreakdown(summary.dailyTotals);

  return (
    <div className="pb-20">
      {/* Back nav + actions */}
      <div className="container mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/reports">
            <Button variant="ghost" size="sm" className="gap-2 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              All Reports
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <DownloadPdfButton report={report} prevReport={prevReport} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2 cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="container mx-auto px-4">
        <ReportHero report={report} comparison={comparison} />
      </div>

      <div className="container mx-auto px-4 mt-8 space-y-8">

        {/* ── Highlight chips ── */}
        <InsightHighlights highlights={highlights} />

        {/* ── Stat cards ── */}
        <StatCardsRow summary={summary} formatCurrency={formatCurrency} />

        {/* ── Calendar + Health gauge ── */}
        <div className="grid gap-4 lg:grid-cols-2">
          <SpendingCalendar cells={dayGrid} monthLabel={report.monthLabel} />
          <NeedsWantsGauge byType={summary.byType} verdict={verdict} />
        </div>

        {/* ── Daily area chart ── */}
        <DailyChart dailyTotals={summary.dailyTotals} formatCurrency={formatCurrency} />

        {/* ── Category breakdown (interactive) ── */}
        <CategoryBreakdownChart categories={summary.byCategory} totalSpent={summary.totalSpent} />

        {/* ── Weekday pattern + Payment methods ── */}
        <div className="grid gap-4 lg:grid-cols-2">
          <WeekdayCard weekdays={weekdays} formatCurrency={formatCurrency} />
          <PaymentMethodsCard summary={summary} formatCurrency={formatCurrency} />
        </div>

        {/* ── AI Insights ── */}
        {report.aiInsights && <AiInsightsCard insights={report.aiInsights} />}

        {/* ── MoM Comparison (only if previous report exists) ── */}
        {comparison && prevReport && (
          <ComparisonSection
            comparison={comparison}
            currentReport={report}
            previousReport={prevReport}
          />
        )}
      </div>
      {/* Delete confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this report?</AlertDialogTitle>
            <AlertDialogDescription>
              The{" "}
              <span className="font-semibold text-foreground">
                {report.monthLabel}
              </span>{" "}
              report will be permanently deleted. This cannot be undone — but
              you can regenerate it at any time from the Reports page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting…" : "Delete Report"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Animated stat cards ────────────────────────────────────────────────────────

function StatCardsRow({
  summary,
  formatCurrency,
}: {
  summary: Report["summary"];
  formatCurrency: (n: number) => string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();

  const cards = [
    {
      title: "Total Spent",
      value: <CountUp end={summary.totalSpent} duration={1000} />,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Transactions",
      value: <span>{summary.transactionCount}</span>,
      icon: <BarChart3 className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Avg Daily",
      value: <CountUp end={summary.avgDaily} duration={900} />,
      icon: <CreditCard className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Largest",
      value: <CountUp end={summary.largestExpense} duration={800} />,
      subtitle: summary.largestExpenseDescription,
      icon: <ShoppingBag className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div ref={ref} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => (
        <Card
          key={c.title}
          className={cn(
            "transition-all duration-500",
            inView ? "reveal-up opacity-100" : "opacity-0 translate-y-4",
            i === 0 && "stagger-1",
            i === 1 && "stagger-2",
            i === 2 && "stagger-3",
            i === 3 && "stagger-4"
          )}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-sm text-muted-foreground">{c.title}</p>
              {c.icon}
            </div>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
            {c.subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Daily area chart ──────────────────────────────────────────────────────────

function DailyChart({
  dailyTotals,
  formatCurrency,
}: {
  dailyTotals: Report["summary"]["dailyTotals"];
  formatCurrency: (n: number) => string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <Card ref={ref} className={cn("transition-all duration-500", inView ? "reveal-up" : "opacity-0")}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Daily Spending
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTotals} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="reportDailyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0088FE" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0088FE" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return isNaN(d.getTime()) ? v : format(d, "d MMM");
                }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => formatCurrency(v)}
                width={72}
              />
              <Tooltip
                formatter={(v: number) => [formatCurrency(v), "Spent"]}
                labelFormatter={(l) => {
                  const d = new Date(l);
                  return isNaN(d.getTime()) ? l : format(d, "EEEE, MMMM d");
                }}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#0088FE"
                strokeWidth={2}
                fill="url(#reportDailyGrad)"
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive={inView}
                animationBegin={0}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Weekday pattern card ───────────────────────────────────────────────────────

function WeekdayCard({
  weekdays,
  formatCurrency,
}: {
  weekdays: ReturnType<typeof weekdayBreakdown>;
  formatCurrency: (n: number) => string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const maxAmount = Math.max(...weekdays.map((w) => w.amount), 1);

  return (
    <Card ref={ref} className={cn("h-full transition-all duration-500", inView ? "reveal-up" : "opacity-0")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Spending by Weekday
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekdays} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} width={68} />
              <Tooltip
                formatter={(v: number) => [formatCurrency(v), "Spent"]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} isAnimationActive={inView} animationDuration={700}>
                {weekdays.map((entry, i) => (
                  <Cell
                    key={entry.day}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                    opacity={entry.amount === maxAmount ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Payment methods ────────────────────────────────────────────────────────────

function PaymentMethodsCard({
  summary,
  formatCurrency,
}: {
  summary: Report["summary"];
  formatCurrency: (n: number) => string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const sorted = [...summary.byPaymentMethod].sort((a, b) => b.amount - a.amount);

  return (
    <Card ref={ref} className={cn("h-full transition-all duration-500 stagger-2", inView ? "reveal-up" : "opacity-0")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          Payment Methods
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.map((pm, i) => {
          const pct = summary.totalSpent > 0 ? (pm.amount / summary.totalSpent) * 100 : 0;
          return (
            <div key={pm.paidBy} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  {pm.paidBy}
                </span>
                <span className="text-muted-foreground text-xs">
                  {formatCurrency(pm.amount)} · {pm.count} txn
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{
                    width: inView ? `${pct}%` : "0%",
                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ── AI Insights callout ────────────────────────────────────────────────────────

function AiInsightsCard({ insights }: { insights: string }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <Card
      ref={ref}
      className={cn(
        "border-primary/20 bg-gradient-to-br from-primary/5 to-background",
        "transition-all duration-500",
        inView ? "reveal-up" : "opacity-0"
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-5 w-5 text-primary" />
          AI Insights
          <Sparkles className="h-3.5 w-3.5 text-primary/60 ml-auto" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{insights}</p>
      </CardContent>
    </Card>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────────

function ReportSkeleton() {
  return (
    <div className="animate-pulse pb-12">
      <div className="h-56 bg-muted rounded-2xl mx-4 mt-4" />
      <div className="container mx-auto px-4 mt-8 space-y-6">
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-40 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5 h-24" /></Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card><CardContent className="p-5 h-64" /></Card>
          <Card><CardContent className="p-5 h-64" /></Card>
        </div>
        <Card><CardContent className="p-5 h-72" /></Card>
      </div>
    </div>
  );
}
