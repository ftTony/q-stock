"use client";

import dynamic from "next/dynamic";
import { useEffect, useTransition, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { HeroAtmosphere } from "@/components/marketing/hero-atmosphere";
import {
  MarketSnapshotCard,
  type SnapshotRowView,
} from "@/components/marketing/market-snapshot-card";
import { useSectionReveal } from "@/components/marketing/use-section-reveal";

const MarketingFeatureScreens = dynamic(
  () =>
    import("@/components/marketing/marketing-feature-screens").then((m) => ({
      default: m.MarketingFeatureScreens,
    })),
  { ssr: true },
);

const MarketingSectionDots = dynamic(
  () =>
    import("@/components/marketing/marketing-section-dots").then((m) => ({
      default: m.MarketingSectionDots,
    })),
  { ssr: true },
);

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

function ScrollHint({ href }: { href: string }) {
  const t = useTranslations("marketing");
  return (
    <a
      href={href}
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
  );
}

function HeroScreen({
  snapshot,
}: {
  snapshot: { rows: SnapshotRowView[]; asOf: string | null };
}) {
  const t = useTranslations("marketing");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { ref, visible } = useSectionReveal(0.35, { once: false });

  return (
    <section id="hero" ref={ref} className={`${SCREEN} overflow-hidden`}>
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
            <MarketSnapshotCard rows={snapshot.rows} asOf={snapshot.asOf} />
          </Reveal>
        </div>
      </div>
      <ScrollHint href="#features" />
    </section>
  );
}

export function MarketingLanding({
  snapshot,
  evidence,
  dualChannel,
  trustAndStory,
}: {
  snapshot: { rows: SnapshotRowView[]; asOf: string | null };
  /**
   * 证据 / 双通道 / 信任+缘起 三段由服务端渲染后经 props 传入，
   * 区块本体不进客户端 JS 包（入场动画由内嵌的客户端 `Reveal` 负责）。
   */
  evidence: ReactNode;
  dualChannel: ReactNode;
  trustAndStory: ReactNode;
}) {
  useEffect(() => {
    document.documentElement.classList.add("mkt-lock");
    return () => document.documentElement.classList.remove("mkt-lock");
  }, []);

  return (
    <div className="relative">
      <MarketingSectionDots />
      <HeroScreen snapshot={snapshot} />
      <MarketingFeatureScreens />
      {evidence}
      {dualChannel}
      {trustAndStory}
    </div>
  );
}
