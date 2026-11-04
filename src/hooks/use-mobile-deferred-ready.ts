"use client";

import { useEffect, useState } from "react";
import { LG_MIN, useMinWidth } from "@/hooks/use-min-width";

/**
 * Desktop: always true after hydration (≥ lg).
 * Mobile: true after idle / short timeout — defer below-fold work without
 * delaying desktop first paint.
 */
export function useMobileDeferredReady(delayMs = 500): boolean {
  const isDesktop = useMinWidth(LG_MIN);
  const [mobileReady, setMobileReady] = useState(false);

  useEffect(() => {
    if (isDesktop) return;
    let idleId: number | undefined;
    const timer = window.setTimeout(() => setMobileReady(true), delayMs);
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(
        () => {
          window.clearTimeout(timer);
          setMobileReady(true);
        },
        { timeout: delayMs + 1200 },
      );
    }
    return () => {
      window.clearTimeout(timer);
      if (
        idleId != null &&
        typeof window.cancelIdleCallback === "function"
      ) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [isDesktop, delayMs]);

  return isDesktop || mobileReady;
}
