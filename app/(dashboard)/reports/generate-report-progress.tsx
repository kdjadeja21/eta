"use client";

import { useEffect, useState, useRef } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerateReportProgressProps {
  month: string;
  onDone: (reportId: string) => void;
  onError: () => void;
}

const WARMUP_STAGES = [
  { label: "Fetching expenses", targetProgress: 22, durationMs: 900 },
  { label: "Categorizing with AI", targetProgress: 52, durationMs: 1400 },
  { label: "Crunching numbers", targetProgress: 72, durationMs: 800 },
  { label: "Saving report", targetProgress: 85, durationMs: 600 },
];

const ALL_STAGE_LABELS = [
  "Fetching expenses",
  "Categorizing with AI",
  "Crunching numbers",
  "Saving report",
  "Done!",
];

export function GenerateReportProgress({
  month,
  onDone,
  onError,
}: GenerateReportProgressProps) {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const onDoneRef = useRef(onDone);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onDoneRef.current = onDone;
    onErrorRef.current = onError;
  }, [onDone, onError]);

  const fetchPromiseRef = useRef<Promise<Response> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const animate = (from: number, to: number, durationMs: number) =>
      new Promise<void>((resolve) => {
        const start = performance.now();
        const tick = () => {
          if (cancelled) return resolve();
          const t = Math.min((performance.now() - start) / durationMs, 1);
          const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          setProgress(from + (to - from) * eased);
          if (t < 1) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });

    const sleep = (ms: number) =>
      new Promise<void>((r) => setTimeout(r, ms));

    const run = async () => {
      if (!fetchPromiseRef.current) {
        const [year, monthNum] = month.split("-").map(Number);
        const timezoneOffset = new Date(year, monthNum - 1, 15).getTimezoneOffset();

        fetchPromiseRef.current = fetch("/api/reports/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ month, timezoneOffset }),
        });
      }
      const fetchPromise = fetchPromiseRef.current;

      for (let i = 0; i < WARMUP_STAGES.length; i++) {
        if (cancelled) return;
        setStageIndex(i);
        const prev = i === 0 ? 0 : WARMUP_STAGES[i - 1].targetProgress;
        await animate(prev, WARMUP_STAGES[i].targetProgress, WARMUP_STAGES[i].durationMs);
      }

      if (cancelled) return;
      setIsWaiting(true);

      let res: Response;
      try {
        res = await fetchPromise;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Network error — could not reach server";
        if (!cancelled) setError(message);
        return;
      }

      if (cancelled) return;
      setIsWaiting(false);

      if (!res.ok) {
        let msg = "Failed to generate report";
        try {
          const data = await res.json();
          msg = data.error ?? msg;
        } catch {
          // ignore parse errors
        }
        if (!cancelled) setError(msg);
        return;
      }

      let data: { reportId: string };
      try {
        data = await res.json();
      } catch {
        if (!cancelled) setError("Server returned an unexpected response");
        return;
      }

      if (cancelled) return;
      setStageIndex(ALL_STAGE_LABELS.length - 1);
      await animate(WARMUP_STAGES[WARMUP_STAGES.length - 1].targetProgress, 100, 500);
      setIsDone(true);
      await sleep(700);
      if (!cancelled) onDoneRef.current(data.reportId);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [month]);

  const currentLabel = isDone
    ? "Done!"
    : isWaiting
      ? "Waiting for server…"
      : ALL_STAGE_LABELS[stageIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-labelledby="generate-report-title"
    >
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-12">
        <div className="space-y-2 text-center">
          <h2 id="generate-report-title" className="text-title">
            Generating report
          </h2>
          <p className="text-meta">{formatMonthLabel(month)}</p>
        </div>

        <div className="mt-10 space-y-3">
          <div className="flex justify-between text-ui">
            <span
              className={cn(
                "font-medium transition-colors duration-300",
                isDone ? "text-[var(--good)]" : "text-foreground"
              )}
            >
              {currentLabel}
            </span>
            <span className="text-muted-foreground tabular-nums">
              {isWaiting ? "…" : `${Math.round(progress)}%`}
            </span>
          </div>

          <div className="relative h-2 overflow-hidden rounded-sm bg-muted">
            {isWaiting ? (
              <div className="absolute inset-y-0 w-2/5 animate-pulse rounded-sm bg-primary/40" />
            ) : (
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-sm bg-primary transition-[width]",
                  isDone && "bg-[var(--good)]"
                )}
                style={{ width: `${progress}%` }}
              />
            )}
          </div>
        </div>

        <ul className="mt-8 space-y-3">
          {ALL_STAGE_LABELS.map((label, i) => {
            const isCompleted =
              isDone || (i < stageIndex && !isWaiting) || (isWaiting && i < WARMUP_STAGES.length);
            const isCurrent =
              !isDone &&
              ((isWaiting && i === WARMUP_STAGES.length - 1) ||
                (!isWaiting && i === stageIndex));

            return (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-3 text-ui transition-colors",
                  isCompleted && "text-[var(--good)]",
                  isCurrent && "font-medium text-foreground",
                  !isCompleted && !isCurrent && "text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="size-4 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="size-4 shrink-0 animate-spin" />
                ) : (
                  <div className="size-4 shrink-0 rounded-full border border-border" />
                )}
                <span>{label}</span>
              </li>
            );
          })}
        </ul>

        {error && (
          <div className="mt-8 rounded-md border border-destructive/30 bg-[var(--danger-soft)] p-4 text-ui text-destructive">
            <p className="font-medium">Report generation failed</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={() => onErrorRef.current()}
              className="mt-3 underline underline-offset-2"
            >
              Go back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
