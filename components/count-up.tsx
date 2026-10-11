"use client";

import { useFormattedCurrency } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const MAX_AMOUNT_FONT_PX = 24;
const MIN_AMOUNT_FONT_PX = 11;

function integerDigitCount(amount: number) {
  const value = Number.isFinite(amount) ? Math.abs(Math.trunc(amount)) : 0;
  return Math.max(1, String(value).length);
}

const SLOW_NUMBERS = 5;
const SLOW_WAITS_MS = [50, 70, 110, 170, 250];

/** Each added wait is larger than the one before it: 20, 40, 60, then 80ms. */
function slowStepMs(step: number) {
  return SLOW_WAITS_MS[Math.min(step, SLOW_WAITS_MS.length) - 1];
}

function roundCents(amount: number) {
  return Math.round(amount * 100) / 100;
}

/** Fast approach up to the last 5 whole numbers. */
function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

/**
 * Fallback sizes for amounts longer than five digits. Narrow stat cards
 * (two-up on phones, five-up on large screens) cannot hold text-2xl past that.
 * Layout measurement then nudges the size to the largest that still fits.
 */
function amountSizeClass(digits: number) {
  if (digits <= 5) return "text-2xl";
  if (digits <= 7) return "text-xs sm:text-lg md:text-xl lg:text-sm xl:text-xl";
  if (digits <= 9) return "text-[11px] sm:text-base md:text-lg lg:text-xs xl:text-lg";
  return "text-[10px] sm:text-sm md:text-base lg:text-[11px] xl:text-base";
}

export default function CountUp({
  end,
  duration = 1000,
  fit = false,
  className,
}: {
  end: number;
  duration?: number;
  fit?: boolean;
  className?: string;
}) {
  const formattedAmount = useFormattedCurrency();
  const [value, setValue] = useState(0);
  const displayValueRef = useRef(0);
  const frameRef = useRef<number | undefined>(undefined);
  const slowTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const formattedEnd = formattedAmount(end);

  useEffect(() => {
    const start = displayValueRef.current;
    const target = end;

    if (start === target) {
      setValue(target);
      return;
    }

    const distance = target - start;
    const direction = distance > 0 ? 1 : -1;
    const wholeSteps = Math.min(SLOW_NUMBERS, Math.floor(Math.abs(distance)));
    const fastEnd = roundCents(target - direction * wholeSteps);
    let slowStep = 0;

    const clearSlow = () => {
      if (slowTimeoutRef.current !== undefined) {
        clearTimeout(slowTimeoutRef.current);
        slowTimeoutRef.current = undefined;
      }
    };

    const stop = () => {
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
      }
      clearSlow();
    };

    const runSlowStep = () => {
      slowStep += 1;
      const next =
        slowStep >= wholeSteps ? target : roundCents(fastEnd + direction * slowStep);
      displayValueRef.current = next;
      setValue(next);
      if (slowStep >= wholeSteps) return;
      slowTimeoutRef.current = setTimeout(runSlowStep, slowStepMs(slowStep + 1));
    };

    const startSlow = () => {
      if (wholeSteps === 0) {
        displayValueRef.current = target;
        setValue(target);
        return;
      }
      slowTimeoutRef.current = setTimeout(runSlowStep, slowStepMs(1));
    };

    if (roundCents(fastEnd) === roundCents(start)) {
      setValue(start);
      startSlow();
      return stop;
    }

    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = easeOutQuint(progress);
      const next = start + (fastEnd - start) * eased;

      if (progress >= 1) {
        displayValueRef.current = fastEnd;
        setValue(fastEnd);
        startSlow();
        return;
      }

      displayValueRef.current = next;
      setValue(next);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return stop;
  }, [end, duration]);

  useLayoutEffect(() => {
    if (!fit) return;

    const container = containerRef.current;
    const text = textRef.current;
    const measure = measureRef.current;
    if (!container || !text || !measure) return;

    let cancelled = false;

    const fitToCard = () => {
      if (cancelled) return;

      const available = container.clientWidth;
      if (available <= 0) return;

      // Fixed and off-screen so the full string is measured, not clipped by the card.
      measure.style.fontSize = `${MAX_AMOUNT_FONT_PX}px`;
      const needed = measure.offsetWidth;
      if (needed <= 0) return;

      const digits = integerDigitCount(end);
      const slack = digits > 5 ? 8 : 0;
      const budget = Math.max(available - slack, 1);
      const overflows = needed > budget;
      const scaled = (budget / needed) * MAX_AMOUNT_FONT_PX;
      let size =
        digits <= 5 && !overflows
          ? MAX_AMOUNT_FONT_PX
          : Math.max(MIN_AMOUNT_FONT_PX, Math.min(MAX_AMOUNT_FONT_PX, scaled));

      text.style.fontSize = `${size}px`;
      measure.style.fontSize = `${size}px`;
      if (measure.offsetWidth > budget && size > MIN_AMOUNT_FONT_PX) {
        size = Math.max(MIN_AMOUNT_FONT_PX, size * (budget / measure.offsetWidth));
        text.style.fontSize = `${size}px`;
      }
    };

    fitToCard();
    const observer = new ResizeObserver(fitToCard);
    observer.observe(container);
    void document.fonts?.ready.then(fitToCard);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [end, fit, formattedEnd]);

  if (!fit) {
    return (
      <span className={cn("tabular-nums", className)}>
        {formattedAmount(value)}
      </span>
    );
  }

  return (
    <span ref={containerRef} className={cn("relative block w-full min-w-0", className)}>
      <span
        ref={textRef}
        className={cn(
          "block max-w-full whitespace-nowrap font-bold tabular-nums leading-tight",
          amountSizeClass(integerDigitCount(end))
        )}
      >
        {formattedAmount(value)}
      </span>
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-[-9999px] left-0 whitespace-nowrap font-bold tabular-nums leading-tight opacity-0"
      >
        {formattedEnd}
      </span>
    </span>
  );
}
