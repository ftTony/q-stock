"use client";

import type { ReactNode, Ref } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useSectionReveal } from "@/components/marketing/use-section-reveal";

type FeatureKey = "markets" | "watchlist" | "analysis" | "paper" | "alerts";

/** Supporting tools around the AI hero. */
const SUPPORTING: FeatureKey[] = [
  "markets",
  "watchlist",
  "analysis",
  "paper",
];

const HREF: Record<FeatureKey | "ai", string> = {
  markets: "/markets",
  watchlist: "/watchlist",
  analysis: "/analysis",
  paper: "/portfolio",
  alerts: "/alerts",
  ai: "/login",
};

const AI_POINTS = ["chart", "chat", "scenario"] as const;

const SCREEN =
  "relative flex min-h-[calc(100dvh-3.5rem)] snap-start snap-always flex-col justify-center pb-20 pt-12";

function Reveal({
  inView,
  delay = 0,
  className = "",
  children,
}: {
  inView: boolean;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`mkt-reveal ${inView ? "is-in" : ""} ${className}`}
      style={{ ["--mkt-delay" as string]: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function ScrollHint({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="mkt-chevron absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-[var(--muted)] transition hover:text-[var(--foreground)]"
    >
      <svg
        className="h-7 w-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </a>
  );
}

function FeatureIcon({ name }: { name: FeatureKey | "ai" }) {
  const common = {
    className: "h-5 w-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  switch (name) {
    case "markets":
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 15l3-4 3 2 4-6" />
        </svg>
      );
    case "watchlist":
      return (
        <svg {...common}>
          <path d="M12 3l2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8L6.7 19.6l1-6L3.4 9.4l6-.9L12 3z" />
        </svg>
      );
    case "analysis":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="7" height="16" rx="1.5" />
          <rect x="14" y="8" width="7" height="12" rx="1.5" />
        </svg>
      );
    case "ai":
      return (
        <svg {...common} className="h-6 w-6">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
      );
    case "paper":
      return (
        <svg {...common}>
          <path d="M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 7 3.5z" />
          <path d="M9.5 8h5M9.5 12h5M9.5 16h3.5" />
        </svg>
      );
    case "alerts":
      return (
        <svg {...common}>
          <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      );
  }
}

function AiHeroCard({ inView }: { inView: boolean }) {
  const t = useTranslations("marketing");

  return (
    <Reveal inView={inView} delay={180}>
      <div
        className="relative overflow-hidden rounded-2xl border border-[var(--brand)]/25 p-6 sm:p-8"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--brand) 12%, var(--panel)), var(--panel))",
        }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-2xl">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-text)]">
              <FeatureIcon name="ai" />
            </span>
            <h3 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
              {t("aiHighlight.title")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] sm:text-[15px]">
              {t("aiHighlight.body")}
            </p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-3">
              {AI_POINTS.map((key) => (
                <li
                  key={key}
                  className="rounded-xl border border-[var(--border)]/80 bg-[var(--panel)]/70 px-3 py-2.5 text-sm leading-snug text-[var(--foreground)]"
                >
                  {t(`aiHighlight.points.${key}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
            <Link
              href={HREF.ai}
              className="qt-btn qt-btn-primary inline-flex h-11 items-center justify-center px-5 text-sm"
            >
              {t("aiHighlight.cta")}
            </Link>
            <Link
              href={HREF.markets}
              className="qt-btn qt-btn-ghost inline-flex h-11 items-center justify-center px-5 text-sm"
            >
              {t("aiHighlight.ctaSecondary")}
            </Link>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function FeatureCard({
  featureKey,
  inView,
  delay,
}: {
  featureKey: FeatureKey;
  inView: boolean;
  delay: number;
}) {
  const t = useTranslations("marketing");
  return (
    <Reveal inView={inView} delay={delay}>
      <Link
        href={HREF[featureKey]}
        className="group flex h-full flex-col rounded-2xl border border-[var(--border)] p-4 transition hover:border-[var(--brand-text)] sm:p-5"
        style={{
          background: "color-mix(in srgb, var(--panel) 82%, transparent)",
        }}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-text)]">
          <FeatureIcon name={featureKey} />
        </span>
        <h3 className="mt-3 text-[15px] font-semibold tracking-tight group-hover:text-[var(--brand-text)]">
          {t(`features.${featureKey}.title`)}
        </h3>
        <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-[var(--muted)]">
          {t(`features.${featureKey}.body`)}
        </p>
        <span className="mt-3 text-xs font-medium text-[var(--brand-text)] opacity-0 transition group-hover:opacity-100">
          {t("featureOpen")} →
        </span>
      </Link>
    </Reveal>
  );
}

/** Capabilities board: AI hero + supporting tools. */
export function MarketingFeatureScreens() {
  const t = useTranslations("marketing");
  const { ref, visible } = useSectionReveal(0.2);

  return (
    <section
      id="features"
      ref={ref as Ref<HTMLElement>}
      className={SCREEN}
      style={{
        background: "color-mix(in srgb, var(--panel) 55%, transparent)",
      }}
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <Reveal inView={visible}>
          <p className="text-xs font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">
            {t("featureZones.capabilities.eyebrow")}
          </p>
        </Reveal>
        <Reveal inView={visible} delay={80}>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            {t("featureZones.capabilities.title")}
          </h2>
        </Reveal>
        <Reveal inView={visible} delay={140}>
          <p className="mt-3 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
            {t("featureZones.capabilities.subtitle")}
          </p>
        </Reveal>

        <div className="mt-8 space-y-4">
          <AiHeroCard inView={visible} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-3">
            {SUPPORTING.map((key, i) => (
              <FeatureCard
                key={key}
                featureKey={key}
                inView={visible}
                delay={260 + i * 50}
              />
            ))}
          </div>
        </div>
      </div>
      <ScrollHint href="#trust" label={t("scrollNext")} />
    </section>
  );
}
