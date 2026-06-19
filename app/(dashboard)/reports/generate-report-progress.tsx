"use client";

import { useEffect, useState, useRef } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerateReportProgressProps {
  month: string;
  onDone: (reportId: string) => void;
  onError: () => void;
}

// Stages shown during the initial animated warm-up (before server responds).
// The final "Done!" stage is shown only once the server actually returns.
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
  // Use a ref for waiting-for-server state to avoid stale closures
  const [isWaiting, setIsWaiting] = useState(false);

  // Store callbacks in refs so they never trigger the effect again
  const onDoneRef = useRef(onDone);
  const onErrorRef = useRef(onError);
  onDoneRef.current = onDone;
  onErrorRef.current = onError;

  // Hold the in-flight fetch Promise across React Strict Mode remounts so the
  // API is only called once even when the effect is double-invoked.
  const fetchPromiseRef = useRef<Promise<Response> | null>(null);

  // Only depends on `month` — stable for the lifetime of this overlay
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
      // Reuse an already-started request (Strict Mode remount) rather than
      // firing a second one. The ref persists across the cleanup/remount cycle.
      if (!fetchPromiseRef.current) {
        fetchPromiseRef.current = fetch("/api/reports/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ month }),
        });
      }
      const fetchPromise = fetchPromiseRef.current;

      // Run warm-up stage animations concurrently with the fetch
      for (let i = 0; i < WARMUP_STAGES.length; i++) {
        if (cancelled) return;
        setStageIndex(i);
        const prev = i === 0 ? 0 : WARMUP_STAGES[i - 1].targetProgress;
        await animate(prev, WARMUP_STAGES[i].targetProgress, WARMUP_STAGES[i].durationMs);
      }

      // Warm-up done — wait for the server. Show a gentle indeterminate pulse.
      if (cancelled) return;
      setIsWaiting(true);

      let res: Response;
      try {
        res = await fetchPromise;
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Network error — could not reach server");
        return;
      }

      if (cancelled) return;
      setIsWaiting(false);

      if (!res.ok) {
        let msg = "Failed to generate report";
        try {
          const data = await res.json();
          msg = data.error ?? msg;
        } catch {}
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

      // Snap to Done
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]); // intentionally omit callbacks — stored in refs above

  const currentLabel = isDone
    ? "Done!"
    : isWaiting
      ? "Waiting for AI…"
      : ALL_STAGE_LABELS[stageIndex];

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full max-w-md mx-4 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold">Generating Report</h2>
          <p className="text-muted-foreground text-sm">
            Analysing your expenses for{" "}
            <span className="font-medium text-foreground">
              {formatMonthLabel(month)}
            </span>
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span
              className={cn(
                "font-medium transition-colors duration-300",
                isDone ? "text-emerald-500" : "text-foreground"
              )}
            >
              {currentLabel}
            </span>
            <span className="text-muted-foreground tabular-nums">
              {isWaiting ? "…" : `${Math.round(progress)}%`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
            {isWaiting ? (
              /* Indeterminate sliding bar while waiting for server */
              <div className="absolute inset-y-0 w-2/5 rounded-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 animate-indeterminate" />
            ) : (
              /* Determinate fill — rAF drives width, no CSS transition conflict */
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full overflow-hidden",
                  isDone ? "bg-emerald-500" : "bg-primary"
                )}
                style={{ width: `${progress}%` }}
              >
                {!isDone && (
                  <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {ALL_STAGE_LABELS.map((label, i) => {
            const isCompleted =
              isDone || (i < stageIndex && !isWaiting) || (isWaiting && i < WARMUP_STAGES.length);
            const isCurrent =
              !isDone &&
              ((isWaiting && i === WARMUP_STAGES.length - 1) ||
                (!isWaiting && i === stageIndex));

            return (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-3 text-sm transition-all duration-300",
                  isCompleted && "text-emerald-500",
                  isCurrent && "text-foreground font-medium",
                  !isCompleted && !isCurrent && "text-muted-foreground/40"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                ) : (
                  <div className="h-4 w-4 shrink-0 rounded-full border border-current/30" />
                )}
                <span>{label}</span>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive space-y-2">
            <p className="font-medium">Report generation failed</p>
            <p>{error}</p>
            <button
              onClick={onErrorRef.current}
              className="text-xs underline underline-offset-2 cursor-pointer"
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
