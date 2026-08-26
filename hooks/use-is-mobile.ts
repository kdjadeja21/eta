"use client";

import { useSyncExternalStore } from "react";

function subscribeToMobileQuery(breakpoint: number, callback: () => void) {
  const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getMobileSnapshot(breakpoint: number) {
  return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches;
}

function getMobileServerSnapshot() {
  return false;
}

export function useIsMobile(breakpoint = 768) {
  return useSyncExternalStore(
    (callback) => subscribeToMobileQuery(breakpoint, callback),
    () => getMobileSnapshot(breakpoint),
    getMobileServerSnapshot
  );
}
