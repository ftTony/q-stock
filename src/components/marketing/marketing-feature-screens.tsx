"use client";

import type { ReactNode, Ref, SVGProps } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useSectionReveal } from "@/components/marketing/use-section-reveal";
import { useMounted } from "@/hooks/use-mounted";

type LoopKey = "watch" | "verify" | "review";
type SideLinkKey = "watchlist" | "analysis" | "multi" | "learn" | "tools";

const LOOP: {
  key: LoopKey;
  href: string;
  sides?: { key: SideLinkKey; href: string }[];
}[] = [
  {
    key: "watch",
    href: "/markets",
    sides: [
      { key: "watchlist", href: "/watchlist" },
      { key: "analysis", href: "/analysis" },
      { key: "multi", href: "/multi-chart" },
    ],
  },
  { key: "verify", href: "/lab" },
  { key: "review", href: "/portfolio" },
];

const EXTENSIONS: { key: SideLinkKey; href: string }[] = [
  { key: "learn", href: "/learn" },
  { key: "tools", href: "/tools" },
];

const SCREEN =
  "relative flex min-h-[calc(100dvh-3.5rem)] snap-start snap-always flex-col justify-center pb-20 pt-12";

const PANEL =
  "color-mix(in srgb, var(--panel) 88%, transparent)";

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

function Svg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-5 w-5"
      {...props}
    />
  );
}

function LoopIcon({ name }: { name: LoopKey | "ai" }) {
  switch (name) {
    case "watch":
      return (
        <Svg>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 15l3-4 3 2 4-6" />
        </Svg>
      );
    case "verify":
      return (
        <Svg>
          <path d="M4 17l4-4 3 2 5-7 4 3" />
          <path d="M4 21h16" />
        </Svg>
      );
    case "review":
      return (
        <Svg>
          <path d="M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 7 3.5z" />
          <path d="M9.5 8h5M9.5 12h5M9.5 16h3.5" />
        </Svg>
      );
    case "ai":
      return (
        <Svg className="h-[1.15rem] w-[1.15rem]">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </Svg>
      );
  }
}

function LoopCard({
  step,
  inView,
  delay,
}: {
  step: (typeof LOOP)[number];
  inView: boolean;
  delay: number;
}) {
  const t = useTranslations("marketing");
  const base = `featureZones.capabilities.loop.${step.key}` as const;

  return (
    <Reveal inView={inView} delay={delay} className="h-full min-w-0">
      <article
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] p-5 transition hover:border-[var(--brand-text)]/40 sm:p-6"
        style={{ background: PANEL }}
      >
        <span
          className="pointer-events-none absolute right-3 top-10 select-none text-[3.75rem] font-semibold leading-none tabular-nums tracking-tight text-[var(--brand-text)] opacity-[0.07]"
          aria-hidden
        >
          {t(`${base}.step`)}
        </span>

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-text)]">
            <LoopIcon name={step.key} />
          </span>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--brand-text)]">
            {t(`${base}.label`)}
            <span className="sr-only">
              {" "}
              {t(`${base}.step`)}
            </span>
          </p>
        </div>

        <h3 className="relative mt-4 text-lg font-semibold tracking-tight">
          {t(`${base}.title`)}
        </h3>
        <p className="relative mt-2 flex-1 text-[13px] leading-relaxed text-[var(--muted)] sm:text-sm">
          {t(`${base}.body`)}
        </p>

        {step.sides ? (
          <ul className="relative mt-4 flex flex-wrap gap-1.5">
            {step.sides.map((side) => (
              <li key={side.key}>
                <Link
                  href={side.href}
                  className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--panel)]/70 px-2.5 py-1 text-[12px] text-[var(--muted)] transition hover:border-[var(--brand-text)] hover:text-[var(--brand-text)]"
                >
                  {t(`features.${side.key}.title`)}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        <Link
          href={step.href}
          className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-text)] transition group-hover:gap-2.5"
        >
          {t(`${base}.cta`)}
          <span aria-hidden>→</span>
        </Link>
      </article>
    </Reveal>
  );
}

function AiCrosscut({ inView }: { inView: boolean }) {
  const t = useTranslations("marketing");
  const { status } = useSession();
  const mounted = useMounted();
  const loggedIn = mounted && status === "authenticated";
  const sessionReady = mounted && status !== "loading";

  return (
    <Reveal inView={inView} delay={380}>
      <div
        className="mt-4 overflow-hidden rounded-2xl border border-[var(--brand)]/20 p-5 sm:mt-5 sm:p-6"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--brand) 10%, var(--panel)), var(--panel))",
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="flex min-w-0 gap-3.5 sm:gap-4">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-text)]">
              <LoopIcon name="ai" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--muted)]">
                {t("featureZones.capabilities.aiEyebrow")}
              </p>
              <h3 className="mt-1 text-base font-semibold tracking-tight sm:text-lg">
                {t("aiHighlight.title")}
              </h3>
              <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-[var(--muted)] sm:text-sm">
                {loggedIn
                  ? t("aiHighlight.bodyLoggedIn")
                  : t("aiHighlight.body")}
              </p>
              <p className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[var(--foreground)]/75">
                <span>{t("aiHighlight.points.chart")}</span>
                <span className="text-[var(--border)]" aria-hidden>
                  ·
                </span>
                <span>{t("aiHighlight.points.chat")}</span>
                <span className="text-[var(--border)]" aria-hidden>
                  ·
                </span>
                <span>{t("aiHighlight.points.scenario")}</span>
              </p>
            </div>
          </div>

          {sessionReady ? (
            <div className="flex shrink-0 flex-wrap gap-2 sm:pl-14 lg:pl-0">
              <Link
                href="/markets"
                className="qt-btn qt-btn-primary inline-flex h-10 items-center justify-center px-4 text-sm"
              >
                {loggedIn
                  ? t("aiHighlight.ctaLoggedIn")
                  : t("aiHighlight.ctaSecondary")}
              </Link>
              {!loggedIn ? (
                <Link
                  href="/login"
                  className="qt-btn qt-btn-ghost inline-flex h-10 items-center justify-center px-4 text-sm"
                >
                  {t("aiHighlight.cta")}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}

function ExtensionsRow({ inView }: { inView: boolean }) {
  const t = useTranslations("marketing");
  return (
    <Reveal inView={inView} delay={440}>
      <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px] text-[var(--muted)]">
        <span className="mr-1 font-medium text-[var(--foreground)]/65">
          {t("featureZones.capabilities.extensionsLabel")}
        </span>
        {EXTENSIONS.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="rounded-lg border border-[var(--border)] bg-[var(--panel)]/60 px-2.5 py-1 transition hover:border-[var(--brand-text)] hover:text-[var(--brand-text)]"
          >
            {t(`features.${item.key}.title`)}
          </Link>
        ))}
      </div>
    </Reveal>
  );
}

/** Capabilities: watch → verify → review cards; AI cross-cut; learn/tools extensions. */
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

        <div className="mt-8 grid gap-3 sm:mt-9 sm:gap-4 lg:grid-cols-3">
          {LOOP.map((step, i) => (
            <LoopCard
              key={step.key}
              step={step}
              inView={visible}
              delay={180 + i * 70}
            />
          ))}
        </div>

        <AiCrosscut inView={visible} />
        <ExtensionsRow inView={visible} />
      </div>
      <ScrollHint href="#deploy" label={t("scrollNext")} />
    </section>
  );
}
