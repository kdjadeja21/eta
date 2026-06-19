import type {
  ReportSummary,
  DailyTotal,
  CategoryBreakdown,
  TypeBreakdown,
  Report,
} from "./report-service";

// ─── Day grid for calendar heatmap ────────────────────────────────────────────

export interface DayCell {
  date: string; // "yyyy-MM-dd"
  amount: number;
  dayNum: number; // 1-31
  weekday: number; // 0=Sun … 6=Sat
  isPadding: boolean; // filler before day 1
  isToday: boolean;
}

export function buildDayGrid(month: string, dailyTotals: DailyTotal[]): DayCell[] {
  const [year, monthNum] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const firstWeekday = new Date(year, monthNum - 1, 1).getDay(); // 0=Sun
  const todayStr = new Date().toISOString().slice(0, 10);

  const amountByDate: Record<string, number> = {};
  for (const d of dailyTotals) {
    amountByDate[d.date] = d.amount;
  }

  const cells: DayCell[] = [];

  // Padding cells before month starts
  for (let p = 0; p < firstWeekday; p++) {
    cells.push({ date: "", amount: 0, dayNum: 0, weekday: p, isPadding: true, isToday: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(monthNum).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const dateStr = `${year}-${mm}-${dd}`;
    cells.push({
      date: dateStr,
      amount: amountByDate[dateStr] ?? 0,
      dayNum: d,
      weekday: (firstWeekday + d - 1) % 7,
      isPadding: false,
      isToday: dateStr === todayStr,
    });
  }

  return cells;
}

// ─── Insights / highlight chips ───────────────────────────────────────────────

export interface Highlight {
  emoji: string;
  text: string;
}

export function deriveHighlights(summary: ReportSummary, monthLabel: string): Highlight[] {
  const chips: Highlight[] = [];
  const { byType, topCategories, dailyTotals, transactionCount, totalSpent, avgDaily, largestExpense, largestExpenseDescription } = summary;

  const activeDays = dailyTotals.filter((d) => d.amount > 0).length;
  const totalDays = dailyTotals.length > 0 ? (() => {
    const dates = dailyTotals.map((d) => new Date(d.date));
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));
    return Math.round((max.getTime() - min.getTime()) / 86400000) + 1;
  })() : 30;

  const grandTotal = byType.need + byType.want + byType.not_sure;

  if (grandTotal > 0) {
    const needsPct = Math.round((byType.need / grandTotal) * 100);
    const wantsPct = Math.round((byType.want / grandTotal) * 100);
    if (needsPct >= 60) chips.push({ emoji: "✅", text: `${needsPct}% of spend was on essentials — great discipline` });
    else if (wantsPct >= 50) chips.push({ emoji: "🛍️", text: `${wantsPct}% of spend went to wants this month` });
    else chips.push({ emoji: "⚖️", text: `Balanced month: ${needsPct}% needs, ${wantsPct}% wants` });
  }

  if (topCategories[0]) {
    chips.push({
      emoji: "🏆",
      text: `Top category: ${topCategories[0].category} (${topCategories[0].percentage.toFixed(0)}% of total)`,
    });
  }

  chips.push({ emoji: "📅", text: `Spent on ${activeDays} of ${Math.max(activeDays, totalDays)} days` });

  if (transactionCount > 0 && totalSpent > 0) {
    const avgTxn = totalSpent / transactionCount;
    chips.push({ emoji: "🧾", text: `${transactionCount} transactions · avg ${_compact(avgTxn)} each` });
  }

  if (largestExpense > 0 && largestExpenseDescription) {
    chips.push({
      emoji: "💸",
      text: `Biggest single expense: "${largestExpenseDescription}"`,
    });
  }

  // Best / worst day
  if (dailyTotals.length > 0) {
    const peak = dailyTotals.reduce((a, b) => (b.amount > a.amount ? b : a));
    if (peak.amount > 0) {
      const dayLabel = _dayLabel(peak.date);
      chips.push({ emoji: "📈", text: `Highest-spend day: ${dayLabel}` });
    }
  }

  return chips;
}

function _compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}K`;
  return n.toFixed(0);
}

function _dayLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

// ─── Needs vs Wants verdict ────────────────────────────────────────────────────

export interface NeedsWantsVerdict {
  needsPct: number;
  wantsPct: number;
  notSurePct: number;
  label: string;
  tone: "positive" | "neutral" | "warning";
  description: string;
}

export function needsWantsVerdict(byType: TypeBreakdown): NeedsWantsVerdict {
  const total = byType.need + byType.want + byType.not_sure;
  if (total === 0) {
    return { needsPct: 0, wantsPct: 0, notSurePct: 0, label: "No data", tone: "neutral", description: "No expense type data available." };
  }
  const needsPct = Math.round((byType.need / total) * 100);
  const wantsPct = Math.round((byType.want / total) * 100);
  const notSurePct = 100 - needsPct - wantsPct;

  let label: string;
  let tone: NeedsWantsVerdict["tone"];
  let description: string;

  if (needsPct >= 70) {
    label = "Disciplined";
    tone = "positive";
    description = "Mostly covering essentials. Well managed.";
  } else if (needsPct >= 50) {
    label = "Balanced";
    tone = "positive";
    description = "Good balance between needs and wants.";
  } else if (wantsPct >= 60) {
    label = "Want-heavy";
    tone = "warning";
    description = "More than half went to discretionary spending.";
  } else if (notSurePct >= 40) {
    label = "Uncategorized";
    tone = "neutral";
    description = "A lot of expenses haven't been classified yet.";
  } else {
    label = "Mixed";
    tone = "neutral";
    description = "A mix of needs, wants, and unclassified spend.";
  }

  return { needsPct, wantsPct, notSurePct, label, tone, description };
}

// ─── Month-over-month comparison ──────────────────────────────────────────────

export type Trend = "up" | "down" | "flat" | "new";

export interface CategoryTrend {
  category: string;
  currentAmount: number;
  previousAmount: number;
  delta: number; // absolute
  deltaPct: number; // signed %
  trend: Trend;
}

export interface MoMComparison {
  totalDeltaPct: number;
  totalDelta: number;
  trend: Trend;
  needsDeltaPct: number;
  wantsDeltaPct: number;
  categoryTrends: CategoryTrend[];
}

export function compareReports(current: Report, previous: Report): MoMComparison {
  const curTotal = current.summary.totalSpent;
  const prevTotal = previous.summary.totalSpent;

  const totalDelta = curTotal - prevTotal;
  const totalDeltaPct = prevTotal > 0 ? (totalDelta / prevTotal) * 100 : 0;
  const totalTrend: Trend = Math.abs(totalDeltaPct) < 1 ? "flat" : totalDelta > 0 ? "up" : "down";

  const curNeedsTotal = current.summary.byType.need + current.summary.byType.want + current.summary.byType.not_sure;
  const prevNeedsTotal = previous.summary.byType.need + previous.summary.byType.want + previous.summary.byType.not_sure;
  const curNeedsPct = curNeedsTotal > 0 ? (current.summary.byType.need / curNeedsTotal) * 100 : 0;
  const prevNeedsPct = prevNeedsTotal > 0 ? (previous.summary.byType.need / prevNeedsTotal) * 100 : 0;
  const needsDeltaPct = curNeedsPct - prevNeedsPct;

  const curWantsPct = curNeedsTotal > 0 ? (current.summary.byType.want / curNeedsTotal) * 100 : 0;
  const prevWantsPct = prevNeedsTotal > 0 ? (previous.summary.byType.want / prevNeedsTotal) * 100 : 0;
  const wantsDeltaPct = curWantsPct - prevWantsPct;

  const prevCatMap: Record<string, number> = {};
  for (const c of previous.summary.topCategories) {
    prevCatMap[c.category] = c.amount;
  }

  const categoryTrends: CategoryTrend[] = current.summary.topCategories.map((c) => {
    const prev = prevCatMap[c.category] ?? 0;
    const delta = c.amount - prev;
    const deltaPct = prev > 0 ? (delta / prev) * 100 : 100;
    const trend: Trend = prev === 0 ? "new" : Math.abs(deltaPct) < 2 ? "flat" : delta > 0 ? "up" : "down";
    return { category: c.category, currentAmount: c.amount, previousAmount: prev, delta, deltaPct, trend };
  });

  return { totalDeltaPct, totalDelta, trend: totalTrend, needsDeltaPct, wantsDeltaPct, categoryTrends };
}

// ─── Weekday breakdown ─────────────────────────────────────────────────────────

export interface WeekdaySpend {
  day: string; // "Sun", "Mon", …
  amount: number;
  txCount: number;
}

export function weekdayBreakdown(dailyTotals: DailyTotal[]): WeekdaySpend[] {
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const acc: Record<number, { amount: number; txCount: number }> = {};
  for (let i = 0; i < 7; i++) acc[i] = { amount: 0, txCount: 0 };

  for (const d of dailyTotals) {
    if (d.amount === 0) continue;
    const wd = new Date(d.date).getDay();
    acc[wd].amount += d.amount;
    acc[wd].txCount += 1;
  }

  return DAY_NAMES.map((day, i) => ({ day, ...acc[i] }));
}
