"use client";

import { useInView } from "@/hooks/use-in-view";
import type { Highlight } from "@/lib/report-insights";
import { cn } from "@/lib/utils";

interface InsightHighlightsProps {
  highlights: Highlight[];
}

export function InsightHighlights({ highlights }: InsightHighlightsProps) {
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <div ref={ref}>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Month Highlights
      </p>
      <div className="flex flex-wrap gap-2">
        {highlights.map((h, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl border bg-card text-sm font-medium shadow-sm",
              "transition-all duration-300",
              inView ? "reveal-up opacity-100" : "opacity-0 translate-y-4",
              i === 0 && "stagger-1",
              i === 1 && "stagger-2",
              i === 2 && "stagger-3",
              i === 3 && "stagger-4",
              i === 4 && "stagger-5",
              i >= 5 && "stagger-6"
            )}
          >
            <span className="text-base leading-none">{h.emoji}</span>
            <span className="text-foreground/90">{h.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
