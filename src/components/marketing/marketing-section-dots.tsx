"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const SECTIONS = [
  { id: "hero", labelKey: "dotHero" as const },
  { id: "features", labelKey: "dotFeatures" as const },
  { id: "trust", labelKey: "dotTrust" as const },
  { id: "story", labelKey: "dotStory" as const },
];

export function MarketingSectionDots() {
  const t = useTranslations("marketing");
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const root = document.querySelector("main.mkt-scroll");
    if (!root) return;

    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { root, threshold: [0.45, 0.6, 0.75] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label={t("dotNav")}
      className="pointer-events-none fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 flex-col gap-2.5 sm:right-5 md:pointer-events-auto md:flex"
    >
      {SECTIONS.map((s) => {
        const on = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            title={t(s.labelKey)}
            aria-label={t(s.labelKey)}
            aria-current={on ? "true" : undefined}
            className={`block h-2 w-2 rounded-full transition ${
              on
                ? "scale-125 bg-[var(--brand-text)]"
                : "bg-[var(--muted)]/45 hover:bg-[var(--muted)]"
            }`}
          />
        );
      })}
    </nav>
  );
}
