/** Ink-opacity chart palette + rust accent for v2 ledger charts. */
export const CHART_INK = {
  20: "var(--chart-ink-20)",
  40: "var(--chart-ink-40)",
  70: "var(--chart-ink-70)",
} as const;

export const CHART_ACCENT = "var(--accent-rust)";

export function chartInkSteps(count: number): string[] {
  const steps = [CHART_INK[70], CHART_INK[40], CHART_INK[20]];
  return Array.from({ length: count }, (_, i) => steps[i % steps.length]);
}

export function chartInkWithAccent(count: number, accentIndex = 0): string[] {
  const colors = chartInkSteps(count);
  if (accentIndex >= 0 && accentIndex < colors.length) {
    colors[accentIndex] = CHART_ACCENT;
  }
  return colors;
}
