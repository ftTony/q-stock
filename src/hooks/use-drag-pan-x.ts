"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

/** Hide-scrollbar horizontal pan via pointer drag (no native scrollbar UX). */
export function useDragPanX(
  ref: RefObject<HTMLElement | null>,
  /** Re-stick to the end (newest columns on the right) when this changes. */
  stickEndKey?: string | number,
) {
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    scroll: number;
    moved: boolean;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth;
  }, [ref, stickEndKey]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("button, a, input, select, textarea")) return;
      // Do not preventDefault here — that would kill row clicks.
      dragRef.current = {
        pointerId: e.pointerId,
        x: e.clientX,
        scroll: el.scrollLeft,
        moved: false,
      };
    };

    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) <= 3) return;
        drag.moved = true;
        el.setPointerCapture(e.pointerId);
        setDragging(true);
      }
      el.scrollLeft = drag.scroll - dx;
      e.preventDefault();
    };

    const onUp = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      if (drag.moved) {
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          /* already released */
        }
      }
      dragRef.current = null;
      setDragging(false);
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove, { passive: false });
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [ref, stickEndKey]);

  return { dragging, movedRef: dragRef };
}
