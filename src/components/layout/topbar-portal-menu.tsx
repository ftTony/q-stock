"use client";

import {
  useLayoutEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

type Align = "right" | "left";

type Props = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  /** Used for outside-click so parent can treat menu as part of the control. */
  menuRef?: RefObject<HTMLDivElement | null>;
  align?: Align;
  /** Menu width in px — keeps right-edge aligned with the trigger. */
  width?: number;
  className?: string;
  children: ReactNode;
};

/**
 * Fixed portal menu for header chrome.
 * Avoids clipping by workbench `overflow-hidden` parents (language / alerts / avatar).
 */
export function TopbarPortalMenu({
  open,
  anchorRef,
  menuRef,
  align = "right",
  width = 208,
  className = "",
  children,
}: Props) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setPos(null);
      return;
    }
    const place = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const left =
        align === "right"
          ? Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8))
          : Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
      setPos({ top: r.bottom + 6, left });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, anchorRef, align, width]);

  if (!open || !pos || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={menuRef}
      className={`fixed z-[90] ${className}`}
      style={{ top: pos.top, left: pos.left, width }}
    >
      {children}
    </div>,
    document.body,
  );
}
