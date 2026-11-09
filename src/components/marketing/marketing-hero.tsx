"use client";

import type { ReactNode, Ref } from "react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { HeroAtmosphere } from "@/components/marketing/hero-atmosphere";
import { useSectionReveal } from "@/components/marketing/use-section-reveal";

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

/** 首屏：文案 + CTA + 快照槽；入场只播一次，氛围不 remount。 */
export function MarketingHero({
  snapshotSlot,
}: {
  snapshotSlot: ReactNode;
}) {
  const t = useTranslations("marketing");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { ref, visible } = useSectionReveal(0.35, { once: true });

  return (
    <section
      id="hero"
      ref={ref as Ref<HTMLElement>}
      className={`${SCREEN} overflow-hidden`}
    >
      <HeroAtmosphere inView={visible} />
      <div className="relative z-[1] mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14">
          <div className="min-w-0">
            <Reveal inView={visible} delay={0}>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">
                {t("heroLine")}
              </p>
            </Reveal>
            <Reveal inView={visible} delay={60}>
              <h1 className="mt-3 text-[30px] font-semibold tracking-tight sm:text-4xl md:text-5xl">
                <span className="block">{t("heroTitleLine1")}</span>
                <span className="block">{t("heroTitleLine2")}</span>
              </h1>
            </Reveal>
            <Reveal inView={visible} delay={120}>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:mt-5 sm:text-[15px]">
                {t("heroSupport")}
              </p>
            </Reveal>
            <Reveal inView={visible} delay={180}>
              <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:mt-8 sm:gap-3">
                <button
                  type="button"
                  disabled={pending}
                  onMouseEnter={() => router.prefetch("/markets")}
                  onFocus={() => router.prefetch("/markets")}
                  onClick={() => startTransition(() => router.push("/markets"))}
                  className="qt-btn qt-btn-primary h-11 px-5 text-sm disabled:opacity-70"
                >
                  {pending ? tCommon("loading") : t("ctaEnter")}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onMouseEnter={() => router.prefetch("/pricing")}
                  onFocus={() => router.prefetch("/pricing")}
                  onClick={() => startTransition(() => router.push("/pricing"))}
                  className="qt-btn qt-btn-ghost h-11 px-5 text-sm disabled:opacity-70"
                >
                  {t("ctaDeploy")}
                </button>
                <a
                  href="#features"
                  className="hidden text-sm font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--foreground)] hover:underline sm:inline"
                >
                  {t("ctaStory")}
                </a>
              </div>
            </Reveal>
            <Reveal inView={visible} delay={240}>
              <p className="mt-5 max-w-2xl text-xs leading-relaxed text-[var(--muted)]">
                {t("disclaimerShort")}{" "}
                <Link
                  href="/disclaimer"
                  className="underline-offset-2 hover:text-[var(--foreground)] hover:underline"
                >
                  {t("footerDisclaimer")}
                </Link>
              </p>
            </Reveal>
          </div>

          <Reveal inView={visible} delay={140} className="min-w-0">
            {snapshotSlot}
          </Reveal>
        </div>
      </div>
      <a
        href="#features"
        aria-label={t("scrollNext")}
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
    </section>
  );
}
