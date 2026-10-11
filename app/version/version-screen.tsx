"use client";

import { useLayoutEffect, type ReactNode } from "react";

const VIEWPORT_HEIGHT = "calc(100svh - var(--vv-offset-bottom, 0px))";

export function VersionScreen({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlHeight: html.style.height,
      htmlMinHeight: html.style.minHeight,
      bodyHeight: body.style.height,
      bodyMinHeight: body.style.minHeight,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.height = VIEWPORT_HEIGHT;
    html.style.minHeight = "0";
    body.style.height = VIEWPORT_HEIGHT;
    body.style.minHeight = "0";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      html.style.height = previous.htmlHeight;
      html.style.minHeight = previous.htmlMinHeight;
      body.style.height = previous.bodyHeight;
      body.style.minHeight = previous.bodyMinHeight;
      html.style.overscrollBehavior = previous.htmlOverscroll;
      body.style.overscrollBehavior = previous.bodyOverscroll;
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 z-10 flex flex-col overflow-hidden bg-background"
      style={{ height: VIEWPORT_HEIGHT, maxHeight: VIEWPORT_HEIGHT }}
    >
      {children}
    </div>
  );
}
