"use client";

import type { CSSProperties, ReactNode, Ref } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useSectionReveal } from "@/components/marketing/use-section-reveal";

const TRUST_KEYS = ["learnOnly", "dataBound", "calm", "privacy"] as const;

const TRUST_INDEX: Record<(typeof TRUST_KEYS)[number], string> = {
  learnOnly: "01",
  dataBound: "02",
  calm: "03",
  privacy: "04",
};

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

function ScreenShell({
  id,
  sectionRef,
  nextHref,
  children,
  style,
  className = "",
}: {
  id: string;
  sectionRef: Ref<HTMLElement | null>;
  nextHref?: string;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  const t = useTranslations("marketing");
  return (
    <section
      id={id}
      ref={sectionRef}
      className={`${SCREEN} ${className}`}
      style={style}
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">{children}</div>
      {nextHref ? <ScrollHint href={nextHref} label={t("scrollNext")} /> : null}
    </section>
  );
}

export function MarketingTrustScreen() {
  const t = useTranslations("marketing");
  const { ref, visible } = useSectionReveal(0.2);

  return (
    <ScreenShell id="trust" sectionRef={ref} nextHref="#story">
      <Reveal inView={visible}>
        <p className="text-xs font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">
          {t("trustEyebrow")}
        </p>
      </Reveal>
      <Reveal inView={visible} delay={80}>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
          {t("trustTitle")}
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {TRUST_KEYS.map((key, i) => (
          <Reveal key={key} inView={visible} delay={140 + i * 80}>
            <div
              className="flex h-full gap-4 rounded-2xl border border-[var(--border)] p-5 sm:p-6"
              style={{
                background: "color-mix(in srgb, var(--panel) 82%, transparent)",
              }}
            >
              <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--brand-text)]">
                {TRUST_INDEX[key]}
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                  {t(`trust.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {t(`trust.${key}.body`)}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </ScreenShell>
  );
}

export function MarketingStoryScreen() {
  const t = useTranslations("marketing");
  const { ref, visible } = useSectionReveal(0.2);

  return (
    <section
      id="story"
      ref={ref}
      className="relative flex min-h-[calc(100dvh-3.5rem)] snap-start snap-always flex-col pb-0 pt-12"
      style={{
        background: "color-mix(in srgb, var(--panel) 40%, transparent)",
      }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 sm:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
          <div>
            <Reveal inView={visible}>
              <p className="text-xs font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">
                {t("storyEyebrow")}
              </p>
            </Reveal>
            <Reveal inView={visible} delay={80}>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                {t("storyTitle")}
              </h2>
            </Reveal>
            <Reveal inView={visible} delay={150}>
              <p className="mt-5 text-sm leading-relaxed sm:text-base">
                {t("storyP1")}
              </p>
            </Reveal>
            <Reveal inView={visible} delay={220}>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                {t("storyP2")}
              </p>
            </Reveal>
          </div>

          <Reveal inView={visible} delay={180}>
            <blockquote
              className="rounded-2xl border border-[var(--border)] px-5 py-6 sm:px-6 sm:py-8"
              style={{
                background:
                  "radial-gradient(420px 180px at 10% 0%, color-mix(in srgb, var(--brand) 14%, transparent), transparent), color-mix(in srgb, var(--panel) 88%, transparent)",
              }}
            >
              <p className="text-lg font-semibold leading-snug tracking-tight sm:text-xl">
                {t("storyQuote")}
              </p>
            </blockquote>
          </Reveal>
        </div>
      </div>

      <div
        className="mt-10 shrink-0 border-t border-[var(--border)]"
        style={{
          background: "color-mix(in srgb, var(--panel) 70%, transparent)",
        }}
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-6 sm:py-10">
          <div className="min-w-0">
            <p className="text-lg font-semibold tracking-tight sm:text-xl">
              {t("ctaBandTitle")}
            </p>
            <p className="mt-1.5 text-sm text-[var(--muted)]">{t("ctaBandBody")}</p>
            <nav className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--muted)]">
              <Link href="/about" className="hover:text-[var(--foreground)]">
                {t("footerAbout")}
              </Link>
              <Link href="/learn" className="hover:text-[var(--foreground)]">
                {t("footerLearn")}
              </Link>
              <Link href="/tools" className="hover:text-[var(--foreground)]">
                {t("footerTools")}
              </Link>
              <Link href="/disclaimer" className="hover:text-[var(--foreground)]">
                {t("footerDisclaimer")}
              </Link>
              <Link href="/markets" className="hover:text-[var(--foreground)]">
                {t("footerMarkets")}
              </Link>
            </nav>
          </div>
          <Link
            href="/markets"
            className="qt-btn qt-btn-primary h-11 shrink-0 self-start px-5 text-sm sm:self-center"
          >
            {t("ctaEnter")}
          </Link>
        </div>
      </div>
    </section>
  );
}
