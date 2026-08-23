"use client";

import { useLayoutEffect } from "react";
import { bindVisualViewportOffset } from "@/lib/visual-viewport";

export function VisualViewportOffset() {
  useLayoutEffect(() => {
    return bindVisualViewportOffset();
  }, []);

  return null;
}
