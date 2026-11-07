"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const SECTIONS = [
  { id: "hero", labelKey: "dotHero" as const },
  { id: "features", labelKey: "dotFeatures" as const },
  { id: "deploy", labelKey: "dotDeploy" as const },
  { id: "trust", labelKey: "dotTrust" as const },
  { id: "story", labelKey: "dotStory" as const },
];

export type SectionDotItem = { id: string; label: string };

/** 右侧整屏分页圆点：吸反馈当前屏，点击跳转。供首页（翻译键）与 /lab（props）复用。 */
export function SectionDots({
  items,
  navLabel,
}: {
  items: SectionDotItem[];
  navLabel: string;
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const root = document.querySelector("main.mkt-scroll");
    if (!root) return;

    const els = items.map((s) => document.getElementById(s.id)).filter(
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
  }, [items]);

  return (
    <nav
      aria-label={navLabel}
      className="pointer-events-none fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 flex-col gap-2.5 sm:right-5 md:pointer-events-auto md:flex"
    >
      {items.map((s) => {
        const on = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            title={s.label}
            aria-label={s.label}
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

export function MarketingSectionDots() {
  const t = useTranslations("marketing");
  // 稳定引用：避免每次渲染都重建 IntersectionObserver。
  const items = useMemo(
    () => SECTIONS.map((s) => ({ id: s.id, label: t(s.labelKey) })),
    [t],
  );
  return <SectionDots items={items} navLabel={t("dotNav")} />;
}
