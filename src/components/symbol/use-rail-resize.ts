"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

const WIDTH_KEY = "qstock.symbolRailWidth.v1";
const OPEN_KEY = "qstock.symbolRailOpen.v1";
export const RAIL_MIN = 300;
export const RAIL_MAX = 560;
export const RAIL_DEFAULT = 360;

function clamp(n: number): number {
  return Math.min(RAIL_MAX, Math.max(RAIL_MIN, Math.round(n)));
}

function readWidth(): number {
  if (typeof window === "undefined") return RAIL_DEFAULT;
  try {
    const raw = localStorage.getItem(WIDTH_KEY);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? clamp(n) : RAIL_DEFAULT;
  } catch {
    return RAIL_DEFAULT;
  }
}

function readOpen(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(OPEN_KEY);
    // First visit: open — quote / plan rail is the primary side panel.
    if (raw === null) return true;
    return raw !== "0";
  } catch {
    return true;
  }
}

/** Desktop rail width + open state with localStorage. */
export function useRailResize() {
  const [width, setWidth] = useState(RAIL_DEFAULT);
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
      // Drag handle left of rail: move left → wider rail
      setWidth(clamp(startW + (startX - ev.clientX)));
    };
    const onUp = (ev: PointerEvent) => {
      const next = clamp(startW + (startX - ev.clientX));
      setWidth(next);
      try {
        localStorage.setItem(WIDTH_KEY, String(next));
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
