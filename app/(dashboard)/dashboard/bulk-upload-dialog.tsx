import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import ExcelJS from "exceljs";
import { parse, isValid, addDays } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Normalize a parsed date to noon of the same local calendar day.
 * This prevents day-boundary shifts caused by timezone offsets when dates
 * parsed as UTC midnight (e.g. ISO strings) are compared or displayed in
 * non-UTC timezones. Noon is safely inside any calendar day regardless of DST.
 */
const normalizeToLocalNoon = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);

const tryParseDate = (value: any): Date | null => {
  if (!value) return null;

  if (value instanceof Date && isValid(value)) return normalizeToLocalNoon(value);

  // Excel serial date number — excelEpoch is constructed with local-time constructor
  // so addDays already yields a local-midnight Date; normalise to noon for safety.
  if (typeof value === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const date = addDays(excelEpoch, value);
    return isValid(date) ? normalizeToLocalNoon(date) : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    // Try all known formats using date-fns `parse` which interprets the result
    // in *local* time — avoiding the UTC-midnight offset that parseISO / new Date()
    // produce for date-only strings (e.g. "2024-01-15" → UTC midnight).
    const formatsToTry = [
      "yyyy-MM-dd",
      "MM/dd/yyyy",
      "dd-MM-yyyy",
      "dd/MM/yyyy",
      "MMM dd, yyyy",
      "MMMM d, yyyy",
    ];

    for (const format of formatsToTry) {
      const date = parse(trimmed, format, new Date());
      if (isValid(date)) return normalizeToLocalNoon(date);
    }

    // Last resort: native Date constructor (may interpret ISO strings as UTC).
    // Normalising to local noon corrects the day for any resulting UTC offset.
    const date = new Date(trimmed);
    if (isValid(date)) return normalizeToLocalNoon(date);
  }

  return null;
};

type ParsedRecord = {
  data: Record<string, any>;
  errors: string[];
  rowIndex: number;
};

function validateRecord(
  record: Record<string, any>,
  rowIndex: number
): ParsedRecord {
  const errors: string[] = [];

  if (!record.date || !(record.date instanceof Date)) {
    errors.push("Invalid or missing date");
  }

  const amount =
    typeof record.amount === "number"
      ? record.amount
      : parseFloat(String(record.amount ?? ""));

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push("Invalid or missing amount");
  }

  if (!record.description || String(record.description).trim() === "") {
    errors.push("Missing description");
  }

  const type = String(record.type ?? "")
    .toLowerCase()
    .trim();

  if (!["need", "want", "not_sure"].includes(type)) {
    errors.push("Invalid type");
  }

  if (!record.paidBy || String(record.paidBy).trim() === "") {
    errors.push("Missing paidBy");
  }

  return { data: record, errors, rowIndex };
}

async function parseExcelFile(file: File): Promise<ParsedRecord[]> {
  const data = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(data);
  const sheet = workbook.worksheets[0];

  if (!sheet) {
    throw new Error("No worksheet found in the uploaded file.");
  }

  const headersRow = sheet.getRow(1);
  const headers = headersRow.values as (string | undefined)[];

  if (!headers || headers.length === 0) {
    throw new Error("No headers found in the worksheet.");
  }

  const normalizedHeaders = headers.map((header) =>
    typeof header === "string" ? header.toLowerCase().trim() : header
  );

  return sheet
    .getSheetValues()
    .slice(2)
    .map((row, index) => {
      if (!row || !Array.isArray(row)) return null;

      const normalizedRecord: Record<string, any> = {};
      normalizedHeaders.forEach((header, headerIndex) => {
        if (header && typeof header === "string") {
          const value = row[headerIndex] ?? null;

          if (header === "tags" && typeof value === "string") {
            normalizedRecord[header] = value.split(",").map((tag) => tag.trim());
          } else if (header === "paid by" || header === "paidby") {
            normalizedRecord.paidBy = value;
          } else if (header === "type" && typeof value === "string") {
            normalizedRecord[header] = value.toLowerCase().trim();
          } else if (header === "amount") {
            normalizedRecord[header] =
              typeof value === "number" ? value : parseFloat(String(value ?? ""));
          } else {
            normalizedRecord[header] = header.includes("date")
              ? tryParseDate(value)
              : value;
          }
        }
      });

      const hasContent = Object.values(normalizedRecord).some(
        (value) => value !== null && value !== undefined && value !== ""
      );

      if (!hasContent) return null;

      return validateRecord(normalizedRecord, index + 2);
    })
    .filter((record): record is ParsedRecord => record !== null);
}

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any[]) => Promise<void>;
}

export function BulkUploadDialog({
  open,
  onOpenChange,
  onSubmit,
}: BulkUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [parsedRecords, setParsedRecords] = useState<ParsedRecord[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const totalCount = parsedRecords.length;
  const errorRecords = parsedRecords.filter((record) => record.errors.length > 0);
  const validRecords = parsedRecords.filter((record) => record.errors.length === 0);
  const errorCount = errorRecords.length;
  const validCount = validRecords.length;

  const resetState = () => {
    setStep("upload");
    setFile(null);
    setParsedRecords([]);
    setIsParsing(false);
    setIsSubmitting(false);
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetState();
    }
    onOpenChange(nextOpen);
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsParsing(true);

    try {
      const records = await parseExcelFile(selectedFile);
      setParsedRecords(records);
      setStep("preview");
    } catch (error) {
      console.error(error);
      showErrorToast("Failed to process the file.");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      void processFile(selectedFile);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      void processFile(droppedFile);
    }
  };

  const handleDownloadSample = () => {
    window.location.href = "/sample-expenses.xlsx";
  };

  const handleBack = () => {
    setStep("upload");
    setFile(null);
    setParsedRecords([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (validCount === 0) {
      showErrorToast("No valid records to upload.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(validRecords.map((record) => record.data));
      showSuccessToast(
        errorCount > 0
          ? `Uploaded ${validCount} record${validCount === 1 ? "" : "s"}. Skipped ${errorCount} with errors.`
          : `Uploaded ${validCount} record${validCount === 1 ? "" : "s"} successfully.`
      );
      handleOpenChange(false);
    } catch (error) {
      console.error(error);
      showErrorToast("Failed to upload records.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLabel =
    validCount === 0
      ? "No Valid Records"
      : errorCount === 0
        ? `Upload ${validCount} Record${validCount === 1 ? "" : "s"}`
        : `Upload ${validCount} Valid Record${validCount === 1 ? "" : "s"} (skip ${errorCount})`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" ? "Upload Bulk Records" : "Review Upload"}
          </DialogTitle>
        </DialogHeader>

        {step === "upload" ? (
          <div className="space-y-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <Upload className="mb-3 size-10 text-muted-foreground" />
              <p className="text-sm font-medium">
                {isParsing ? "Parsing file..." : "Click or drag file to upload"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Supports .xlsx and .xls files
              </p>
              {file && !isParsing && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="size-4" />
                  <span className="truncate">{file.name}</span>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />

            <p className="text-center text-sm text-muted-foreground">
              Need a template?{" "}
              <button
                type="button"
                onClick={handleDownloadSample}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Download sample file
              </button>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {file && (
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                <FileSpreadsheet className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{file.name}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <Card className="gap-0 py-4">
                <CardContent className="px-4 text-center">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <Badge variant="secondary" className="mt-2 text-sm">
                    {totalCount}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="gap-0 py-4">
                <CardContent className="px-4 text-center">
                  <p className="text-xs text-muted-foreground">Valid</p>
                  <Badge className="mt-2 bg-emerald-600 text-sm text-white hover:bg-emerald-600">
                    {validCount}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="gap-0 py-4">
                <CardContent className="px-4 text-center">
                  <p className="text-xs text-muted-foreground">Errors</p>
                  <Badge
                    variant={errorCount > 0 ? "destructive" : "secondary"}
                    className="mt-2 text-sm"
                  >
                    {errorCount}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {errorCount > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <AlertCircle className="size-4" />
                  <span>
                    {errorCount} row{errorCount === 1 ? "" : "s"} with errors
                  </span>
                </div>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                  {errorRecords.map((record) => (
                    <div
                      key={record.rowIndex}
                      className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm"
                    >
                      <p className="font-medium">Row {record.rowIndex}</p>
                      <ul className="mt-1 list-inside list-disc text-muted-foreground">
                        {record.errors.map((error) => (
                          <li key={error}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>All records are valid and ready to upload.</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === "preview" && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
              className="mr-auto"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting || isParsing}
          >
            Cancel
          </Button>

          {step === "preview" && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || validCount === 0}
            >
              {isSubmitting ? "Uploading..." : submitLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
