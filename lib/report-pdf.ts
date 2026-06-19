import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import type { Report } from "./report-service";
import type { NeedsWantsVerdict, MoMComparison } from "./report-insights";
import { weekdayBreakdown } from "./report-insights";

// ─── String sanitisation ──────────────────────────────────────────────────────
// jsPDF's built-in fonts (Helvetica / Times / Courier) only cover Latin-1
// (ISO 8859-1, code points 0x00–0xFF). Any character outside that range —
// emojis, ₹ (U+20B9), ✦ (U+2726), etc. — either renders as a wrong glyph
// or, worse, forces jsPDF into a spacing mode that letter-spaces subsequent
// text in the same string.  Always call s() before every doc.text() call.

const CURRENCY_MAP: Record<string, string> = {
  "\u20B9": "Rs.", // ₹ → Rs.
  "\u20AC": "EUR ", // € → EUR
  "\u00A3": "GBP ", // £ (already Latin-1, but just in case)
  "\u00A5": "JPY ", // ¥
};

function s(text: string): string {
  // 1. Replace known currency symbols with ASCII equivalents
  let out = text;
  for (const [sym, rep] of Object.entries(CURRENCY_MAP)) {
    out = out.split(sym).join(rep);
  }
  // 2. Strip anything outside Latin-1 (emojis, arrows, ✦, etc.)
  // eslint-disable-next-line no-control-regex
  out = out.replace(/[^\x00-\xFF]/g, "");
  // 3. Collapse any double spaces that may result
  out = out.replace(/  +/g, " ").trim();
  return out;
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  dark:        [15,  23,  42]  as [number, number, number],
  darkMid:     [30,  41,  59]  as [number, number, number],
  primary:     [29,  78,  216] as [number, number, number],
  primaryBg:   [219, 234, 254] as [number, number, number],
  green:       [22,  163, 74]  as [number, number, number],
  greenBg:     [220, 252, 231] as [number, number, number],
  red:         [220, 38,  38]  as [number, number, number],
  redBg:       [254, 226, 226] as [number, number, number],
  amber:       [217, 119, 6]   as [number, number, number],
  amberBg:     [254, 243, 199] as [number, number, number],
  muted:       [100, 116, 139] as [number, number, number],
  border:      [226, 232, 240] as [number, number, number],
  bg:          [255, 255, 255] as [number, number, number],
  bgAlt:       [248, 250, 252] as [number, number, number],
  text:        [30,  41,  59]  as [number, number, number],
  textMuted:   [100, 116, 139] as [number, number, number],
  // type colours
  need:        [22,  163, 74]  as [number, number, number],
  want:        [37,  99,  235] as [number, number, number],
  notSure:     [217, 119, 6]   as [number, number, number],
  // chart palette
  chart: [
    [0,   136, 254] as [number, number, number],
    [0,   196, 159] as [number, number, number],
    [255, 187, 40]  as [number, number, number],
    [255, 128, 66]  as [number, number, number],
    [136, 132, 216] as [number, number, number],
    [130, 202, 157] as [number, number, number],
    [255, 198, 88]  as [number, number, number],
    [255, 107, 107] as [number, number, number],
    [78,  205, 196] as [number, number, number],
    [69,  183, 209] as [number, number, number],
  ],
};

// ─── Constants ────────────────────────────────────────────────────────────────

const PW = 210; // A4 width mm
const PH = 297; // A4 height mm
const ML = 14;  // margin left
const MR = 14;  // margin right
const CW = PW - ML - MR; // content width
const FOOTER_H = 12;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setFill(doc: jsPDF, rgb: [number, number, number]) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}
function setDraw(doc: jsPDF, rgb: [number, number, number]) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}
function setTxt(doc: jsPDF, rgb: [number, number, number]) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function roundedRect(
  doc: jsPDF,
  x: number, y: number, w: number, h: number,
  r: number,
  fill: [number, number, number],
  stroke?: [number, number, number]
) {
  setFill(doc, fill);
  if (stroke) {
    setDraw(doc, stroke);
    doc.roundedRect(x, y, w, h, r, r, "FD");
  } else {
    doc.roundedRect(x, y, w, h, r, r, "F");
  }
}

function bold(doc: jsPDF) { doc.setFont("helvetica", "bold"); }
function normal(doc: jsPDF) { doc.setFont("helvetica", "normal"); }
function italic(doc: jsPDF) { doc.setFont("helvetica", "italic"); }

/** Draw page footer (page number + brand) */
function drawFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const y = PH - 8;
  setFill(doc, C.dark);
  doc.rect(0, PH - FOOTER_H, PW, FOOTER_H, "F");
  bold(doc);
  doc.setFontSize(8);
  setTxt(doc, C.border);
  doc.text("Expense Tracker  |  Monthly Report", ML, y);
  doc.text(`Page ${pageNum} of ${totalPages}`, PW - MR, y, { align: "right" });
}

/** Draw a labelled divider / section title */
function sectionTitle(doc: jsPDF, text: string, y: number): number {
  bold(doc);
  doc.setFontSize(10);
  setTxt(doc, C.primary);
  doc.text(text.toUpperCase(), ML, y);
  setDraw(doc, C.primary);
  doc.setLineWidth(0.4);
  doc.line(ML, y + 1.5, ML + CW, y + 1.5);
  return y + 7;
}

/** Draw a simple horizontal bar in the PDF (for category / payment bars) */
function hBar(
  doc: jsPDF,
  x: number, y: number, fullW: number, h: number,
  pct: number,
  color: [number, number, number]
) {
  // track bg
  setFill(doc, C.border);
  doc.roundedRect(x, y, fullW, h, h / 2, h / 2, "F");
  // filled portion
  const fw = Math.max((pct / 100) * fullW, 0.5);
  setFill(doc, color);
  doc.roundedRect(x, y, fw, h, h / 2, h / 2, "F");
}

/** Wraps text and returns next Y */
function wrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number
): number {
  const lines = doc.splitTextToSize(text, maxW) as string[];
  doc.text(lines, x, y);
  return y + lines.length * lineH;
}

/** Ensure enough vertical space remains; add page if not */
function ensureSpace(doc: jsPDF, y: number, needed: number, curPage: { n: number }): number {
  if (y + needed > PH - FOOTER_H - 6) {
    doc.addPage();
    curPage.n += 1;
    return 18;
  }
  return y;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function generateReportPdf(
  report: Report,
  verdict: NeedsWantsVerdict,
  comparison: MoMComparison | null,
  prevReport: Report | null,
  formatCurrency: (n: number) => string
): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { summary } = report;
  const curPage = { n: 1 };

  // ── Page 1: Cover header ───────────────────────────────────────────────────

  // Dark top band
  setFill(doc, C.dark);
  doc.rect(0, 0, PW, 52, "F");

  // Subtle diagonal accent strip
  setFill(doc, C.primary);
  doc.rect(PW - 48, 0, 48, 52, "F");

  // App brand
  bold(doc);
  doc.setFontSize(9);
  setTxt(doc, [148, 163, 184]);
  doc.text("EXPENSE TRACKER", ML, 12);

  // "MONTHLY REPORT" label
  doc.setFontSize(8);
  roundedRect(doc, PW - MR - 34, 8, 34, 6, 1.5, C.primary);
  setTxt(doc, C.bg);
  doc.text("MONTHLY REPORT", PW - MR - 17, 12.2, { align: "center" });

  // Month label (big)
  bold(doc);
  doc.setFontSize(28);
  setTxt(doc, C.bg);
  doc.text(s(report.monthLabel), ML, 32);

  // Generated date
  normal(doc);
  doc.setFontSize(8);
  setTxt(doc, [148, 163, 184]);
  doc.text(
    `Generated ${format(report.generatedAt, "MMMM d, yyyy 'at' h:mm a")}`,
    ML,
    42
  );

  if (report.aiCategorizedCount > 0) {
    doc.text(
      `* ${report.aiCategorizedCount} expense${report.aiCategorizedCount !== 1 ? "s" : ""} categorized by AI`,
      ML,
      48
    );
  }

  // ── Key metrics strip ──────────────────────────────────────────────────────

  let y = 62;
  const statW = (CW - 9) / 4;

  const stats = [
    { label: "Total Spent", value: s(formatCurrency(summary.totalSpent)), accent: C.primary },
    { label: "Transactions", value: String(summary.transactionCount), accent: C.green },
    { label: "Avg Daily", value: s(formatCurrency(summary.avgDaily)), accent: C.amber },
    { label: "Largest Expense", value: s(formatCurrency(summary.largestExpense)), accent: C.red },
  ];

  stats.forEach((stat, i) => {
    const sx = ML + i * (statW + 3);
    roundedRect(doc, sx, y, statW, 22, 2, C.bgAlt, C.border);
    // top accent bar
    setFill(doc, stat.accent);
    doc.roundedRect(sx, y, statW, 3, 1, 1, "F");
    // label
    normal(doc);
    doc.setFontSize(7.5);
    setTxt(doc, C.muted);
    doc.text(stat.label, sx + statW / 2, y + 9, { align: "center" });
    // value
    bold(doc);
    doc.setFontSize(10);
    setTxt(doc, C.text);
    doc.text(stat.value, sx + statW / 2, y + 17, { align: "center" });
  });

  y += 30;

  // Largest expense description
  if (summary.largestExpenseDescription) {
    normal(doc);
    doc.setFontSize(7.5);
    setTxt(doc, C.muted);
    doc.text(`Largest: "${s(summary.largestExpenseDescription)}"`, ML, y);
    y += 8;
  }

  // ── Spending Health ────────────────────────────────────────────────────────

  y = sectionTitle(doc, "Spending Health", y);

  const verdictColor =
    verdict.tone === "positive" ? C.greenBg :
    verdict.tone === "warning"  ? C.redBg :
    C.amberBg;
  const verdictTextColor =
    verdict.tone === "positive" ? C.green :
    verdict.tone === "warning"  ? C.red :
    C.amber;

  roundedRect(doc, ML, y, CW, 20, 2, verdictColor as [number,number,number]);
  bold(doc);
  doc.setFontSize(12);
  setTxt(doc, verdictTextColor as [number,number,number]);
  doc.text(s(verdict.label), ML + 5, y + 9);
  normal(doc);
  doc.setFontSize(8);
  setTxt(doc, C.text);
  doc.text(s(verdict.description), ML + 5, y + 15.5);

  // Needs/wants split bar (right side of the box)
  const typeData = [
    { label: "Needs", pct: verdict.needsPct, color: C.need },
    { label: "Wants", pct: verdict.wantsPct, color: C.want },
    { label: "Other", pct: verdict.notSurePct, color: C.notSure },
  ].filter((d) => d.pct > 0);

  const barX = ML + 70;
  const barW = CW - 75;
  let bx = barX;
  const barH = 5;
  const barY = y + 6;
  typeData.forEach((d) => {
    const fw = (d.pct / 100) * barW;
    setFill(doc, d.color);
    doc.rect(bx, barY, fw, barH, "F");
    bx += fw;
  });
  // legend
  let lx = barX;
  const legY = barY + barH + 4;
  typeData.forEach((d) => {
    setFill(doc, d.color);
    doc.rect(lx, legY, 3, 3, "F");
    normal(doc);
    doc.setFontSize(7);
    setTxt(doc, C.text);
    doc.text(`${d.label} ${d.pct}%`, lx + 5, legY + 3);
    lx += 28;
  });

  y += 28;

  // ── Category Breakdown ─────────────────────────────────────────────────────

  y = sectionTitle(doc, "Spending by Category", y);

  const catHead = [["#", "Category", "Amount", "% of Total", "Transactions"]];
  const catBody = summary.byCategory.slice(0, 12).map((c, i) => [
    String(i + 1),
    s(c.category),
    s(formatCurrency(c.amount)),
    `${c.percentage.toFixed(1)}%`,
    String(c.count),
  ]);

  autoTable(doc, {
    head: catHead,
    body: catBody,
    startY: y,
    margin: { left: ML, right: MR },
    styles: {
      fontSize: 8.5,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      lineColor: C.border,
      lineWidth: 0.2,
      textColor: C.text,
    },
    headStyles: {
      fillColor: C.dark,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    alternateRowStyles: { fillColor: C.bgAlt },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 1) {
        const color = C.chart[data.row.index % C.chart.length];
        data.cell.styles.textColor = color;
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawPage: () => {
      curPage.n += 1;
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Inline category bar chart ──────────────────────────────────────────────

  curPage.n = doc.getNumberOfPages();
  y = ensureSpace(doc, y, 60, curPage);
  y = sectionTitle(doc, "Category Distribution", y);

  const top8 = summary.byCategory.slice(0, 8);
  const maxAmt = top8[0]?.amount ?? 1;
  const barRowH = 7;
  const labelW = 52;
  const barAreaW = CW - labelW - 22;

  top8.forEach((c, i) => {
    const rowY = y + i * barRowH;
    const color = C.chart[i % C.chart.length];
    // label
    normal(doc);
    doc.setFontSize(7.5);
    setTxt(doc, C.text);
    const catName = s(c.category);
    const shortened = catName.length > 20 ? catName.slice(0, 19) + "." : catName;
    doc.text(shortened, ML, rowY + 4.5);
    // bar
    hBar(doc, ML + labelW, rowY + 1.5, barAreaW, 4, (c.amount / maxAmt) * 100, color);
    // value
    bold(doc);
    doc.setFontSize(7);
    setTxt(doc, C.muted);
    doc.text(s(formatCurrency(c.amount)), ML + labelW + barAreaW + 2, rowY + 4.5);
  });

  y += top8.length * barRowH + 10;

  // ── Payment Methods ────────────────────────────────────────────────────────

  curPage.n = doc.getNumberOfPages();
  y = ensureSpace(doc, y, 40, curPage);
  y = sectionTitle(doc, "Payment Methods", y);

  const pmHead = [["Payment Method", "Amount", "Transactions", "% of Total"]];
  const pmBody = [...summary.byPaymentMethod]
    .sort((a, b) => b.amount - a.amount)
    .map((pm) => [
      s(pm.paidBy),
      s(formatCurrency(pm.amount)),
      String(pm.count),
      summary.totalSpent > 0 ? `${((pm.amount / summary.totalSpent) * 100).toFixed(1)}%` : "-",
    ]);

  autoTable(doc, {
    head: pmHead,
    body: pmBody,
    startY: y,
    margin: { left: ML, right: MR },
    styles: {
      fontSize: 8.5,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      lineColor: C.border,
      lineWidth: 0.2,
      textColor: C.text,
    },
    headStyles: {
      fillColor: C.darkMid,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: C.bgAlt },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    didDrawPage: () => { curPage.n += 1; },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Weekday Breakdown ──────────────────────────────────────────────────────

  curPage.n = doc.getNumberOfPages();
  y = ensureSpace(doc, y, 40, curPage);
  y = sectionTitle(doc, "Spending by Weekday", y);

  const weekdays = weekdayBreakdown(summary.dailyTotals);
  const maxWd = Math.max(...weekdays.map((w) => w.amount), 1);
  const wdBarW = (CW - 6) / 7;

  weekdays.forEach((wd, i) => {
    const wx = ML + i * (wdBarW + 1);
    const filledH = wd.amount > 0 ? Math.max((wd.amount / maxWd) * 18, 1) : 0;
    const barTop = y + 22 - filledH;
    const color = C.chart[i % C.chart.length];

    // bar track
    setFill(doc, C.border);
    doc.roundedRect(wx, y + 4, wdBarW, 18, 1, 1, "F");
    // bar fill
    if (filledH > 0) {
      setFill(doc, color);
      doc.roundedRect(wx, barTop, wdBarW, filledH, 1, 1, "F");
    }
    // day label
    bold(doc);
    doc.setFontSize(7);
    setTxt(doc, C.text);
    doc.text(wd.day, wx + wdBarW / 2, y + 27, { align: "center" });
    // amount
    if (wd.amount > 0) {
      normal(doc);
      doc.setFontSize(6);
      setTxt(doc, C.muted);
      doc.text(s(formatCurrency(wd.amount)), wx + wdBarW / 2, y + 32, { align: "center" });
    }
  });

  y += 38;

  // ── Daily Spending Highlights ──────────────────────────────────────────────

  if (summary.dailyTotals.length > 0) {
    curPage.n = doc.getNumberOfPages();
    y = ensureSpace(doc, y, 40, curPage);
    y = sectionTitle(doc, "Daily Spending Highlights", y);

    const sorted = [...summary.dailyTotals]
      .filter((d) => d.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const activeDays = summary.dailyTotals.filter((d) => d.amount > 0).length;
    const totalDays = summary.dailyTotals.length;

    normal(doc);
    doc.setFontSize(8);
    setTxt(doc, C.muted);
    doc.text(
      `Spent on ${activeDays} day${activeDays !== 1 ? "s" : ""} · ${totalDays - activeDays} zero-spend day${totalDays - activeDays !== 1 ? "s" : ""}`,
      ML, y
    );
    y += 6;

    const hlHead = [["Date", "Day", "Amount"]];
    const hlBody = sorted.map((d) => {
      const dt = new Date(d.date + "T00:00:00");
      return [
        format(dt, "MMM d, yyyy"),
        format(dt, "EEEE"),
        s(formatCurrency(d.amount)),
      ];
    });

    autoTable(doc, {
      head: hlHead,
      body: hlBody,
      startY: y,
      margin: { left: ML, right: MR },
      tableWidth: CW / 2,
      styles: {
        fontSize: 8.5,
        cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 },
        lineColor: C.border,
        lineWidth: 0.2,
        textColor: C.text,
      },
      headStyles: { fillColor: C.dark, textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: C.bgAlt },
      columnStyles: { 2: { halign: "right", fontStyle: "bold" } },
      didDrawPage: () => { curPage.n += 1; },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── Month-over-Month Comparison ────────────────────────────────────────────

  if (comparison && prevReport) {
    curPage.n = doc.getNumberOfPages();
    y = ensureSpace(doc, y, 55, curPage);
    y = sectionTitle(doc, `vs ${prevReport.monthLabel} (Month over Month)`, y);

    const deltaColor =
      comparison.trend === "down" ? C.green :
      comparison.trend === "up"   ? C.red :
      C.muted;
    const deltaSign = comparison.trend === "up" ? "+" : comparison.trend === "down" ? "−" : "";
    const deltaLabel = comparison.trend === "flat"
      ? "Similar spending to last month"
      : `${deltaSign}${Math.abs(comparison.totalDeltaPct).toFixed(1)}% (${deltaSign}${s(formatCurrency(Math.abs(comparison.totalDelta)))})`;

    roundedRect(doc, ML, y, CW, 14, 2, comparison.trend === "down" ? C.greenBg : comparison.trend === "up" ? C.redBg : C.bgAlt as [number,number,number]);
    bold(doc);
    doc.setFontSize(11);
    setTxt(doc, deltaColor);
    doc.text(deltaLabel, ML + 5, y + 6);
    normal(doc);
    doc.setFontSize(7.5);
    setTxt(doc, C.muted);
    doc.text(
      `${s(prevReport.monthLabel)}: ${s(formatCurrency(prevReport.summary.totalSpent))}  ->  ${s(report.monthLabel)}: ${s(formatCurrency(report.summary.totalSpent))}`,
      ML + 5, y + 11
    );
    y += 20;

    // Category trends table
    const tHead = [["Category", prevReport.monthLabel, report.monthLabel, "Change"]];
    const tBody = comparison.categoryTrends.map((ct) => {
      const sign = ct.trend === "up" ? "^ " : ct.trend === "down" ? "v " : ct.trend === "new" ? "NEW " : "- ";
      return [
        s(ct.category),
        ct.previousAmount > 0 ? s(formatCurrency(ct.previousAmount)) : "-",
        s(formatCurrency(ct.currentAmount)),
        `${sign}${ct.trend !== "flat" && ct.trend !== "new" ? `${Math.abs(ct.deltaPct).toFixed(0)}%` : ""}`,
      ];
    });

    autoTable(doc, {
      head: tHead,
      body: tBody,
      startY: y,
      margin: { left: ML, right: MR },
      styles: {
        fontSize: 8.5,
        cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
        lineColor: C.border,
        lineWidth: 0.2,
        textColor: C.text,
      },
      headStyles: { fillColor: C.darkMid, textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: C.bgAlt },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right", fontStyle: "bold" },
      },
      didParseCell(data) {
        if (data.section === "body" && data.column.index === 3) {
          const ct = comparison!.categoryTrends[data.row.index];
          data.cell.styles.textColor =
            ct.trend === "down" ? C.green :
            ct.trend === "up"   ? C.red :
            ct.trend === "new"  ? C.primary :
            C.muted;
        }
      },
      didDrawPage: () => { curPage.n += 1; },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── AI Insights ────────────────────────────────────────────────────────────

  if (report.aiInsights) {
    curPage.n = doc.getNumberOfPages();
    y = ensureSpace(doc, y, 36, curPage);
    y = sectionTitle(doc, "AI Insights", y);

    roundedRect(doc, ML, y, CW, 2, 1, C.primaryBg as [number,number,number]);
    // Calculate height needed for text
    const insightLines = doc.splitTextToSize(s(report.aiInsights), CW - 10) as string[];
    const insightH = insightLines.length * 5 + 12;
    roundedRect(doc, ML, y, CW, insightH, 3, C.primaryBg as [number,number,number]);

    // Left accent bar
    setFill(doc, C.primary);
    doc.roundedRect(ML, y, 2.5, insightH, 1, 1, "F");

    bold(doc);
    doc.setFontSize(8.5);
    setTxt(doc, C.primary);
    doc.text("AI-Generated Insight", ML + 7, y + 7);

    normal(doc);
    doc.setFontSize(8.5);
    setTxt(doc, C.text);
    const safeInsightLines = doc.splitTextToSize(s(report.aiInsights), CW - 10) as string[];
    doc.text(safeInsightLines, ML + 7, y + 13.5);

    y += insightH + 8;
  }

  // ── Add footers to all pages ───────────────────────────────────────────────

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, p, totalPages);
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  const [year, monthNum] = report.month.split("-").map(Number);
  const filename = `expense-report-${format(new Date(year, monthNum - 1, 1), "MMMM-yyyy")}.pdf`;
  doc.save(filename);
}
