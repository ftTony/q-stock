"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type Side = "left" | "right";

type TooltipPosition = {
  top: number;
  left: number;
};

export function getNavTooltipPosition(
  anchor: Pick<DOMRect, "top" | "left" | "right" | "height">,
  tooltipSize: { width: number; height: number },
  viewportSize: { width: number; height: number },
  side: Side,
): TooltipPosition {
  const edge = 8;
  const gap = 8;
  const maxLeft = Math.max(
    edge,
    viewportSize.width - tooltipSize.width - edge,
  );
  const maxTop = Math.max(
    edge,
    viewportSize.height - tooltipSize.height - edge,
  );
  const preferredLeft =
    side === "right"
      ? anchor.right + gap
      : anchor.left - tooltipSize.width - gap;

  return {
    top: Math.max(
      edge,
      Math.min(
        anchor.top + anchor.height / 2 - tooltipSize.height / 2,
        maxTop,
      ),
    ),
    left: Math.max(edge, Math.min(preferredLeft, maxLeft)),
  };
}

type Props = {
  label: string;
  side: Side;
  children: ReactNode;
};

export function NavIconTooltip({ label, side, children }: Props) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({ top: 0, left: 0 });
  const open = hovered || focused;

  useLayoutEffect(() => {
    if (!open || typeof window === "undefined") return;
    const anchor = anchorRef.current;
    const tooltip = tooltipRef.current;
    if (!anchor || !tooltip) return;

    const anchorRect = anchor.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    setPosition(
      getNavTooltipPosition(
        anchorRect,
        tooltipRect,
        { width: window.innerWidth, height: window.innerHeight },
        side,
      ),
    );

    const close = () => {
      setHovered(false);
      setFocused(false);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open, side]);

  return (
    <span
      ref={anchorRef}
      className="relative inline-flex"
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }}
    >
      {children}
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={tooltipRef}
              role="tooltip"
              className="pointer-events-none fixed z-[60] max-w-[calc(100vw-16px)] break-words rounded-none border border-[var(--border)] bg-[var(--panel)] px-2 py-1 text-xs font-medium text-[var(--foreground)] shadow-none"
              style={{ top: position.top, left: position.left }}
            >
              {label}
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}
