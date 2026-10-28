"use client";

import { useCallback, useSyncExternalStore } from "react";

function useMediaQuery(query: string, serverSnapshot = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );
  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}

/**
 * True when viewport ≥ `px` (Tailwind `lg` = 1024).
 * SSR / hydration snapshot is false; client updates via useSyncExternalStore.
 */
export function useMinWidth(px: number): boolean {
  return useMediaQuery(`(min-width: ${px}px)`);
}

/** True when viewport height ≥ `px`. */
export function useMinHeight(px: number): boolean {
  return useMediaQuery(`(min-height: ${px}px)`);
}

export const LG_MIN = 1024;
/** Tall lab viewport — enough room for 4 card rows + chrome. */
export const LAB_TALL_MIN = 900;
export const SM_MIN = 640;
export const XL_MIN = 1280;
