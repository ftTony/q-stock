"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

export const STACK_BOTTOM_HEIGHT_KEY = "qstock.symbolStackBottom.v1";
export const STACK_BOTTOM_MIN = 220;
export const STACK_BOTTOM_DEFAULT = 360;

function maxHeight(): number {
  if (typeof window === "undefined") return 480;
  return Math.round(window.innerHeight * 0.55);
}

function clamp(n: number): number {
  return Math.min(maxHeight(), Math.max(STACK_BOTTOM_MIN, Math.round(n)));
}

function readHeight(): number {
  if (typeof window === "undefined") return STACK_BOTTOM_DEFAULT;
  try {
    const raw = localStorage.getItem(STACK_BOTTOM_HEIGHT_KEY);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? clamp(n) : clamp(STACK_BOTTOM_DEFAULT);
  } catch {
    return clamp(STACK_BOTTOM_DEFAULT);
  }
}

/** Desktop stack-layout bottom panel height with localStorage. */
export function useStackBottomResize() {
  const [height, setHeight] = useState(STACK_BOTTOM_DEFAULT);
  const [dragging, setDragging] = useState(false);
  const heightRef = useRef(height);
  heightRef.current = height;

  useEffect(() => {
    setHeight(readHeight());
  }, []);

  const applyHeight = useCallback((next: number) => {
    const value = clamp(next);
    setHeight(value);
    try {
      localStorage.setItem(STACK_BOTTOM_HEIGHT_KEY, String(value));
    } catch {
      /* ignore */
    }
    return value;
  }, []);

  const onResizeStart = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      e.preventDefault();
      const startY = e.clientY;
      const startH = heightRef.current;
      setDragging(true);

      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);

      const prevCursor = document.body.style.cursor;
      const prevUserSelect = document.body.style.userSelect;
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";

      const cleanup = () => {
        document.body.style.cursor = prevCursor;
        document.body.style.userSelect = prevUserSelect;
      };

      const onMove = (ev: PointerEvent) => {
        // Handle above bottom pane: drag up → taller
        setHeight(clamp(startH + (startY - ev.clientY)));
      };
      const onUp = (ev: PointerEvent) => {
        applyHeight(startH + (startY - ev.clientY));
        setDragging(false);
        cleanup();
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
    [applyHeight],
  );

  const resetHeight = useCallback(() => {
    applyHeight(STACK_BOTTOM_DEFAULT);
  }, [applyHeight]);

  return { height, dragging, onResizeStart, resetHeight };
}

export function clearStackBottomHeight() {
  try {
    localStorage.removeItem(STACK_BOTTOM_HEIGHT_KEY);
  } catch {
    /* ignore */
  }
}
