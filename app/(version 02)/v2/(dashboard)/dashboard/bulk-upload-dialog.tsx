import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import ExcelJS from "exceljs";
import { parse, parseISO, isValid, addDays } from "date-fns";

const tryParseDate = (value: any): Date | null => {
  if (!value) return null;

  // 1. If it's already a Date
  if (value instanceof Date && isValid(value)) return value;

  // 2. If it's a number, treat as Excel serial date
  if (typeof value === "number") {
    const excelEpoch = new Date(1899, 11, 30); // Excel's start date
    const date = addDays(excelEpoch, value);
    return isValid(date) ? date : null;
  }

  // 3. If it's a string, try common date formats
  if (typeof value === "string") {
    const trimmed = value.trim();

    // Try ISO 8601 (e.g. 2023-09-22 or 2023-09-22T12:34:56Z)
    let date = parseISO(trimmed);
    if (isValid(date)) return date;

    // Try custom fallback formats
    const formatsToTry = [
      "yyyy-MM-dd",
      "MM/dd/yyyy",
      "dd-MM-yyyy",
      "dd/MM/yyyy",
      "MMM dd, yyyy",
      "MMMM d, yyyy",
    ];

    for (const format of formatsToTry) {
      date = parse(trimmed, format, new Date());
      if (isValid(date)) return date;
    }

    // Try Date constructor as last resort
    date = new Date(trimmed);
    if (isValid(date)) return date;
  }

  // Fallback failed
  return null;
};

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
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleDownloadSample = () => {
    window.location.href = "/sample-expenses.xlsx";
  };

  const handleSubmit = async () => {
    if (!file) {
      showErrorToast("Please upload a file.");
      return;
    }

    try {
      setIsSubmitting(true);
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

      // Normalize headers to lowercase
      const normalizedHeaders = headers.map((header) =>
        typeof header === "string" ? header.toLowerCase() : header
      );

      const jsonData = sheet
        .getSheetValues()
        .slice(2)
        .map((row) => {
          if (!row || !Array.isArray(row)) return null;

          const normalizedRecord: Record<string, any> = {};
          normalizedHeaders.forEach((header, index) => {
            if (header && typeof header === "string") {
              const value = row[index] || null;
              if (header === "tags" && typeof value === "string") {
                normalizedRecord[header] = value
                  .split(",")
                  .map((tag) => tag.trim());
              } else if (header === "paid by" || header === "paidby") {
                normalizedRecord["paidBy"] = value;
              } else {
                normalizedRecord[header] = header.includes("date")
                  ? tryParseDate(value)
                  : value;
              }
            }
          });
          return normalizedRecord;
        })
        .filter((record) => record !== null);

      await onSubmit(jsonData);
      showSuccessToast("File uploaded successfully.");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      showErrorToast("Failed to process the file.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Bulk Records</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button onClick={handleDownloadSample} variant="outline">
            Download Sample File
          </Button>
          <Input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
