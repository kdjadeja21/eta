"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ArrowRight, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { reportService, type Report } from "@/lib/report-service";
import { useFormattedCurrency } from "@/lib/currency-utils";
import { buildReportMonthOptions } from "@/lib/report-month-utils";
import { GenerateReportProgress } from "./generate-report-progress";
import Link from "next/link";

interface ReportsContentProps {
  userId: string;
}

export function ReportsContent({ userId }: ReportsContentProps) {
  const formatCurrency = useFormattedCurrency();
  const monthOptions = buildReportMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [pastReports, setPastReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoadingReports(true);
      setLoadError(null);
      try {
        const reports = await reportService.listReports(userId);
        setPastReports(reports);
      } catch {
        setLoadError("Could not load reports.");
      } finally {
        setIsLoadingReports(false);
      }
    };
    load();
  }, [userId]);

  const handleGenerate = () => setIsGenerating(true);

  const handleGenerationDone = (reportId: string) => {
    setIsGenerating(false);
    window.location.href = `/reports/${reportId}`;
  };

  const handleGenerationError = () => setIsGenerating(false);

  const alreadyGenerated = pastReports.find((r) => r.month === selectedMonth);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await reportService.deleteReport(deleteTarget.id);
      setPastReports((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-4 py-6 md:px-8 md:py-10">
      {isGenerating && (
        <GenerateReportProgress
          month={selectedMonth}
          onDone={handleGenerationDone}
          onError={handleGenerationError}
        />
      )}

      <header>
        <h1 className="text-title">Reports</h1>
        <p className="mt-1 text-meta">Monthly statements from your ledger</p>
      </header>

      <section className="rounded-md border border-border bg-card p-6">
        <h2 className="text-section">Generate</h2>
        <p className="mt-2 text-ui text-muted-foreground">
          Pick a completed month. Regenerating returns the cached report if one exists.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-52">
              <Calendar className="mr-2 size-4 text-muted-foreground" />
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {alreadyGenerated ? (
            <Link href={`/reports/${alreadyGenerated.id}`}>
              <Button variant="outline" className="w-full gap-2 sm:w-auto">
                View existing
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          ) : (
            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full sm:w-auto">
              Generate
            </Button>
          )}
        </div>
        {alreadyGenerated && (
          <p className="mt-3 text-meta">
            Generated {format(alreadyGenerated.generatedAt, "MMM d, yyyy")}
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-section">Previous</h2>
        {isLoadingReports ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : loadError ? (
          <p className="text-ui text-destructive">{loadError}</p>
        ) : pastReports.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-6 py-12 text-center">
            <p className="text-ui text-muted-foreground">No reports yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastReports.map((report) => (
              <Card key={report.id} className="rounded-md border-border shadow-none">
                <CardContent className="flex items-start justify-between gap-4 p-5">
                  <Link href={`/reports/${report.id}`} className="min-w-0 flex-1">
                    <p className="text-body font-medium">{report.monthLabel}</p>
                    <p className="text-meta mt-0.5">
                      {format(report.generatedAt, "MMM d, yyyy")} ·{" "}
                      {formatCurrency(report.summary.totalSpent)} ·{" "}
                      {report.summary.transactionCount} txns
                    </p>
                  </Link>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-11 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteTarget(report)}
                      aria-label={`Delete ${report.monthLabel} report`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                    <Link href={`/reports/${report.id}`} aria-label={`Open ${report.monthLabel}`}>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete report?</AlertDialogTitle>
            <AlertDialogDescription>
              The {deleteTarget?.monthLabel} report will be removed. You can regenerate it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-primary-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
