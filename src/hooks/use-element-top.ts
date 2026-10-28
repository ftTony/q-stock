"use client";

import { useEffect, useState } from "react";

/**
 * Live `getBoundingClientRect().top` for a selector (e.g. symbol shell under
 * the sticky app topbar). Used so dock drawers start below chrome, not
 * `inset-y-0` over the header.
 */
export function useElementTop(selector: string | null | undefined): number {
  const [top, setTop] = useState(0);

  useEffect(() => {
    if (!selector) {
      setTop(0);
      return;
    }
    const el = () => document.querySelector(selector);
    const sync = () => {
      const node = el();
      setTop(node ? Math.max(0, Math.round(node.getBoundingClientRect().top)) : 0);
    };
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(sync)
        : null;
    const node = el();
    if (node && ro) ro.observe(node);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
      ro?.disconnect();
    };
  }, [selector]);

  return top;
}
