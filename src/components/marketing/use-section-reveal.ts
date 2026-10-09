"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** Fires once when the section enters the viewport (for enter animations). */
export function useSectionReveal(threshold = 0.35): {
  ref: RefObject<HTMLElement | null>;
  visible: boolean;
} {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, visible]);

  return { ref, visible };
}
