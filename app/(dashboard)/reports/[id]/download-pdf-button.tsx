"use client";

import { useState } from "react";
import { Download, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormattedCurrency } from "@/lib/currency-utils";
import { needsWantsVerdict, compareReports } from "@/lib/report-insights";
import type { Report } from "@/lib/report-service";

interface DownloadPdfButtonProps {
  report: Report;
  prevReport: Report | null;
  /** variant for the button */
  variant?: "default" | "outline" | "secondary";
}

export function DownloadPdfButton({
  report,
  prevReport,
  variant = "outline",
}: DownloadPdfButtonProps) {
  const [state, setState] = useState<"idle" | "generating" | "done">("idle");
  const formatCurrency = useFormattedCurrency();

  const handleDownload = async () => {
    if (state === "generating") return;
    setState("generating");
    try {
      // Dynamically import so jsPDF is NOT part of the initial bundle
      const { generateReportPdf } = await import("@/lib/report-pdf");

      const verdict = needsWantsVerdict(report.summary.byType);
      const comparison = prevReport ? compareReports(report, prevReport) : null;

      generateReportPdf(report, verdict, comparison, prevReport, formatCurrency);
      setState("done");
      setTimeout(() => setState("idle"), 3000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setState("idle");
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleDownload}
      disabled={state === "generating"}
      className="gap-2 cursor-pointer"
    >
      {state === "generating" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : state === "done" ? (
        <FileText className="h-4 w-4 text-green-500" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {state === "generating"
        ? "Generating PDF…"
        : state === "done"
          ? "Downloaded!"
          : "Download PDF"}
    </Button>
  );
}
