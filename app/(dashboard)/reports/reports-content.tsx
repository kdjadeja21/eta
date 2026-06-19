"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FileBarChart2, ArrowRight, Sparkles, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoadingReports(true);
      try {
        const reports = await reportService.listReports(userId);
        setPastReports(reports);
      } finally {
        setIsLoadingReports(false);
      }
    };
    load();
  }, [userId]);

  const handleGenerate = () => {
    setIsGenerating(true);
  };

  const handleGenerationDone = (reportId: string) => {
    setIsGenerating(false);
    window.location.href = `/reports/${reportId}`;
  };

  const handleGenerationError = () => {
    setIsGenerating(false);
  };

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
    <div className="container mx-auto p-4 space-y-8">
      {isGenerating && (
        <GenerateReportProgress
          month={selectedMonth}
          onDone={handleGenerationDone}
          onError={handleGenerationError}
        />
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <FileBarChart2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Monthly Reports</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              AI-powered insights into your monthly spending
            </p>
          </div>
        </div>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate New Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select a completed month and generate a full analysis. Expenses
            without a category will be automatically classified by AI in one
            batch call. Reports are cached — regenerating the same month
            instantly returns the existing report.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-52">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Select month" />
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
                <Button variant="outline" className="cursor-pointer gap-2">
                  View Existing Report
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="cursor-pointer gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Generate Report
              </Button>
            )}
          </div>
          {alreadyGenerated && (
            <p className="text-xs text-muted-foreground">
              A report for{" "}
              <span className="font-medium">
                {monthOptions.find((o) => o.value === selectedMonth)?.label}
              </span>{" "}
              was already generated on{" "}
              {format(alreadyGenerated.generatedAt, "MMM dd, yyyy 'at' h:mm a")}
              .
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Previous Reports</h2>
        {isLoadingReports ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-5 h-28" />
              </Card>
            ))}
          </div>
        ) : pastReports.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <FileBarChart2 className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No reports yet.</p>
              <p className="text-sm text-muted-foreground/70">
                Generate your first report above to get AI-powered spending
                insights.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pastReports.map((report) => (
              <Card
                key={report.id}
                className="hover:border-primary/50 hover:shadow-md transition-all duration-200 h-full group"
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <Link href={`/reports/${report.id}`} className="flex-1 min-w-0">
                      <p className="font-semibold">{report.monthLabel}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Generated {format(report.generatedAt, "MMM dd, yyyy")}
                      </p>
                    </Link>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault();
                          setDeleteTarget(report);
                        }}
                        aria-label="Delete report"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Link href={`/reports/${report.id}`}>
                        <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5" />
                      </Link>
                    </div>
                  </div>
                  <Link href={`/reports/${report.id}`} className="block">
                    <div className="flex justify-between text-sm pt-1 border-t">
                      <div>
                        <p className="text-muted-foreground text-xs">Total Spent</p>
                        <p className="font-semibold">
                          {formatCurrency(report.summary.totalSpent)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-xs">Transactions</p>
                        <p className="font-semibold">
                          {report.summary.transactionCount}
                        </p>
                      </div>
                    </div>
                    {report.summary.topCategories?.[0] && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Top:{" "}
                        <span className="text-foreground font-medium">
                          {report.summary.topCategories[0].category}
                        </span>{" "}
                        ({formatCurrency(report.summary.topCategories[0].amount)})
                      </p>
                    )}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.monthLabel}
              </span>{" "}
              report? This cannot be undone. You can always regenerate it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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
