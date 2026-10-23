"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

const STORAGE_KEY = "qstock.symbolWatchlistWidth.v1";
const OPEN_KEY = "qstock.symbolWatchlistOpen.v1";
export const WATCH_MIN = 180;
export const WATCH_MAX = 420;
export const WATCH_DEFAULT = 260;

function clamp(n: number): number {
  return Math.min(WATCH_MAX, Math.max(WATCH_MIN, Math.round(n)));
}

function readWidth(): number {
  if (typeof window === "undefined") return WATCH_DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? clamp(n) : WATCH_DEFAULT;
  } catch {
    return WATCH_DEFAULT;
  }
}

function readOpen(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(OPEN_KEY);
    if (raw === null) return true;
    return raw !== "0";
  } catch {
    return true;
  }
}

/** Left watchlist width + open state (default open). */
export function useWatchlistResize() {
  const [width, setWidth] = useState(WATCH_DEFAULT);
  const [open, setOpenState] = useState(true);
  const [dragging, setDragging] = useState(false);
  const widthRef = useRef(width);
  widthRef.current = width;

  useEffect(() => {
    setWidth(readWidth());
    setOpenState(readOpen());
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

  const onResizeStart = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = widthRef.current;
    setDragging(true);

    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const prevCursor = document.body.style.cursor;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
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
      const next = clamp(startW + (ev.clientX - startX));
      setWidth(next);
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
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
  }, []);

  return { width, open, setOpen, dragging, onResizeStart };
}
