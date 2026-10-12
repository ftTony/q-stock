"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type Options = {
  /** When false, leave/re-enter toggles visibility so enter animations can replay. */
  once?: boolean;
};

/** Section enter visibility for `mkt-reveal` / hero atmosphere. */
export function useSectionReveal(
  threshold = 0.35,
  options?: Options,
): {
  ref: RefObject<HTMLElement | null>;
  visible: boolean;
} {
  const once = options?.once ?? true;
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          if (once) io.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  return { ref, visible };
}
