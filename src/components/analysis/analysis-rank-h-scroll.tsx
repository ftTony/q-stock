"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

type Props = {
  /** Hidden overflow-x driver; scrollLeft syncs head/body. */
  scrollRef: RefObject<HTMLDivElement | null>;
  contentWidth: number;
  leftGutter: number;
  rightGutter: number;
  onScroll: () => void;
};

/**
 * Bottom mid-only h-scroll: native bar hidden; `.qt-h-thumb` matches vertical
 * `.qt-scroll` pill (4px paint / 10px hit).
 */
export function AnalysisRankHScroll({
  scrollRef,
  contentWidth,
  leftGutter,
  rightGutter,
  onScroll,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startLeft: number;
    trackW: number;
    thumbW: number;
    maxScroll: number;
  } | null>(null);

  const paint = useCallback(() => {
    const el = scrollRef.current;
    const thumb = thumbRef.current;
    const track = trackRef.current;
    if (!el || !thumb || !track) return;
    const trackW = track.clientWidth;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (trackW <= 0 || maxScroll <= 0 || el.scrollWidth <= el.clientWidth) {
      thumb.style.display = "none";
      return;
    }
    const ratio = el.clientWidth / el.scrollWidth;
    const thumbW = Math.max(24, Math.round(trackW * ratio));
    const left = (el.scrollLeft / maxScroll) * (trackW - thumbW);
    thumb.style.display = "block";
    thumb.style.width = `${thumbW}px`;
    // Keep Y centering — paint only moves X (track has real height).
    thumb.style.transform = `translate(${left}px, -50%)`;
  }, [scrollRef]);

  useEffect(() => {
    paint();
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => paint());
    ro.observe(track);
    return () => ro.disconnect();
  }, [paint, contentWidth]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      const el = scrollRef.current;
      if (!d || !el) return;
      const dx = e.clientX - d.startX;
      const maxThumb = Math.max(1, d.trackW - d.thumbW);
      const nextLeft = Math.min(
        maxThumb,
        Math.max(0, d.startLeft + dx),
      );
      el.scrollLeft = (nextLeft / maxThumb) * d.maxScroll;
    };
    const onUp = () => {
      const thumb = thumbRef.current;
      if (thumb) thumb.dataset.dragging = "false";
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [scrollRef]);

  return (
    // h-3 track: absolute children don't stretch the flex item — set height
    // explicitly so `.qt-h-thumb` (10px) is not clipped by overflow-hidden parents.
    <div className="flex h-3 shrink-0 items-stretch bg-[var(--panel)]">
      <div className="shrink-0" style={{ width: leftGutter }} aria-hidden />
      <div ref={trackRef} className="relative h-full min-w-0 flex-1">
        <div
          ref={scrollRef}
          className="absolute inset-0 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          onScroll={() => {
            onScroll();
            paint();
          }}
        >
          <div style={{ width: contentWidth, height: 1 }} aria-hidden />
        </div>
        <div
          ref={thumbRef}
          role="scrollbar"
          aria-orientation="horizontal"
          className="qt-h-thumb absolute left-0 top-1/2"
          onPointerDown={(e) => {
            const el = scrollRef.current;
            const track = trackRef.current;
            const thumb = thumbRef.current;
            if (!el || !track || !thumb) return;
            e.preventDefault();
            thumb.dataset.dragging = "true";
            const trackW = track.clientWidth;
            const thumbW = thumb.offsetWidth;
            const maxScroll = el.scrollWidth - el.clientWidth;
            const startLeft =
              maxScroll > 0
                ? (el.scrollLeft / maxScroll) * (trackW - thumbW)
                : 0;
            dragRef.current = {
              startX: e.clientX,
              startLeft,
              trackW,
              thumbW,
              maxScroll,
            };
            thumb.setPointerCapture?.(e.pointerId);
          }}
        />
      </div>
      <div className="shrink-0" style={{ width: rightGutter }} aria-hidden />
    </div>
  );
}
