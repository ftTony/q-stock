"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * 极小的入场动画包装器：元素进入视口后加 `is-in`，触发 CSS 过渡。
 *
 * 服务端区块（evidence / deploy / trust / story）用它替代原来的
 * section 级 `useSectionReveal`，这样区块本体可以是服务端组件，
 * 只有这几个几行的包装器进客户端包。
 */
export function Reveal({
  delay = 0,
  className = "",
  children,
}: {
  /** 过渡延迟（ms），用于同屏错峰。 */
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`mkt-reveal ${inView ? "is-in" : ""} ${className}`}
      style={{ ["--mkt-delay" as string]: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
