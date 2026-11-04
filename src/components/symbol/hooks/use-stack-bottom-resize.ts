"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

export const STACK_BOTTOM_HEIGHT_KEY = "qstock.symbolStackBottom.v1";
export const STACK_BOTTOM_COLLAPSED_KEY = "qstock.symbolStackBottomCollapsed.v1";
export const STACK_BOTTOM_MIN = 220;
export const STACK_BOTTOM_DEFAULT = 360;
/** Tab strip (~36) + resizer hit area — content hidden when collapsed. */
export const STACK_BOTTOM_COLLAPSED_H = 40;

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

function readCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STACK_BOTTOM_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function writeCollapsed(value: boolean) {
  try {
    localStorage.setItem(STACK_BOTTOM_COLLAPSED_KEY, value ? "1" : "0");
  } catch {
    /* ignore */
  }
}

/** Desktop stack-layout bottom panel height with localStorage. */
export function useStackBottomResize() {
  const [height, setHeight] = useState(STACK_BOTTOM_DEFAULT);
  const [collapsed, setCollapsed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const heightRef = useRef(height);
  const collapsedRef = useRef(collapsed);
  heightRef.current = height;
  collapsedRef.current = collapsed;

  useEffect(() => {
    setHeight(readHeight());
    setCollapsed(readCollapsed());
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

  const setCollapsedPersist = useCallback((next: boolean) => {
    setCollapsed(next);
    writeCollapsed(next);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsedPersist(!collapsedRef.current);
  }, [setCollapsedPersist]);

  const expand = useCallback(() => {
    if (collapsedRef.current) setCollapsedPersist(false);
  }, [setCollapsedPersist]);

  const onResizeStart = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      e.preventDefault();
      // Dragging while collapsed restores the panel first.
      if (collapsedRef.current) setCollapsedPersist(false);

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
    [applyHeight, setCollapsedPersist],
  );

  const resetHeight = useCallback(() => {
    applyHeight(STACK_BOTTOM_DEFAULT);
    setCollapsedPersist(false);
  }, [applyHeight, setCollapsedPersist]);

  const displayHeight = collapsed ? STACK_BOTTOM_COLLAPSED_H : height;

  return {
    height: displayHeight,
    expandedHeight: height,
    collapsed,
    dragging,
    onResizeStart,
    resetHeight,
    toggleCollapsed,
    expand,
  };
}

export function clearStackBottomHeight() {
  try {
    localStorage.removeItem(STACK_BOTTOM_HEIGHT_KEY);
    localStorage.removeItem(STACK_BOTTOM_COLLAPSED_KEY);
  } catch {
    /* ignore */
  }
}
