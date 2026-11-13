"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  SYMBOL_LAYOUT_KEY,
  type SymbolLayoutPrefs,
} from "@/components/symbol/hooks/use-symbol-layout-prefs";

const STORAGE_KEY = "qstock.symbolWatchlistWidth.v1";
const OPEN_KEY = "qstock.symbolWatchlistOpen.v1";
export const WATCH_MIN = 180;
export const WATCH_MAX = 420;
export const WATCH_DEFAULT = 260;

function clamp(n: number): number {
  return Math.min(WATCH_MAX, Math.max(WATCH_MIN, Math.round(n)));
}

/** Persist width — shared with route fallback so soft-nav skeleton matches. */
export function readWatchlistWidth(): number {
  if (typeof window === "undefined") return WATCH_DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? clamp(n) : WATCH_DEFAULT;
  } catch {
    return WATCH_DEFAULT;
  }
}

/**
 * Whether the left watchlist should occupy layout width.
 * Prefers layout prefs v2; falls back to legacy open key.
 * First visit: closed (skip watchlist quote poll on critical path).
 */
export function readWatchlistOpen(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(SYMBOL_LAYOUT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SymbolLayoutPrefs>;
      if (typeof parsed.modules?.watchlist === "boolean") {
        return parsed.modules.watchlist;
      }
    }
    const legacy = localStorage.getItem(OPEN_KEY);
    if (legacy === null) return false;
    return legacy !== "0";
  } catch {
    return false;
  }
}

/** Left watchlist width + open state (default closed for first visit). */
export function useWatchlistResize() {
  // SSR + first client render must match. Reading localStorage in useState
  // causes hydration mismatch (open/width differ → data-resizing tree regenerates).
  const [width, setWidth] = useState(WATCH_DEFAULT);
  const [open, setOpenState] = useState(false);
  const [dragging, setDragging] = useState(false);
  const widthRef = useRef(width);
  widthRef.current = width;

  // Before paint so open watchlist does not flash away after loading.tsx.
  useLayoutEffect(() => {
    setWidth(readWatchlistWidth());
    setOpenState(readWatchlistOpen());
  }, []);

  const setOpen = useCallback((next: boolean | ((v: boolean) => boolean)) => {
    setOpenState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      try {
        localStorage.setItem(OPEN_KEY, value ? "1" : "0");
      } catch {
        /* ignore */
      }
      return value;
    });
  }, []);

  const applyWidth = useCallback((next: number) => {
    const value = clamp(next);
    setWidth(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      /* ignore */
    }
    return value;
  }, []);

  const onResizeStart = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      e.preventDefault();
      const startX = e.clientX;
      const startW = widthRef.current;
      setDragging(true);

      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);

      const prevCursor = document.body.style.cursor;
      const prevUserSelect = document.body.style.userSelect;
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
      document.documentElement.classList.add("aw-rail-resizing");

      const cleanupCursor = () => {
        document.body.style.cursor = prevCursor;
        document.body.style.userSelect = prevUserSelect;
        document.documentElement.classList.remove("aw-rail-resizing");
      };

      const onMove = (ev: PointerEvent) => {
        // Drag handle right of watchlist: move right → wider
        setWidth(clamp(startW + (ev.clientX - startX)));
      };
      const onUp = (ev: PointerEvent) => {
        applyWidth(startW + (ev.clientX - startX));
        setDragging(false);
        cleanupCursor();
        try {
          target.releasePointerCapture(ev.pointerId);
        } catch {
          /* already released */
        }
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [applyWidth],
  );

  const nudgeWidth = useCallback(
    (delta: number) => {
      applyWidth(widthRef.current + delta);
    },
    [applyWidth],
  );

  const resetWidth = useCallback(() => {
    applyWidth(WATCH_DEFAULT);
  }, [applyWidth]);

  return {
    width,
    open,
    setOpen,
    dragging,
    onResizeStart,
    nudgeWidth,
    resetWidth,
  };
}
