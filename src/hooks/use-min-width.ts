"use client";

import { useEffect, useState } from "react";

/** True when viewport ≥ `px` (Tailwind `lg` = 1024). SSR / first paint = false. */
export function useMinWidth(px: number): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${px}px)`);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [px]);

  return matches;
}

export const LG_MIN = 1024;
