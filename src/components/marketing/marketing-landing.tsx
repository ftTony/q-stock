"use client";

import { useEffect, type CSSProperties, type ReactNode, type Ref } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { MarketingFeatureScreens } from "@/components/marketing/marketing-feature-screens";
import {
  MarketingStoryScreen,
  MarketingTrustScreen,
} from "@/components/marketing/marketing-trust-story";
import { MarketingSectionDots } from "@/components/marketing/marketing-section-dots";
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

function ScreenSection({
  id,
  sectionRef,
  nextHref,
  children,
  className = "",
  style,
}: {
  id?: string;
  sectionRef?: Ref<HTMLElement>;
  nextHref?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section
      id={id}
      ref={sectionRef}
      className={`${SCREEN} ${className}`}
      style={style}
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">{children}</div>
      {nextHref ? <ScrollHint href={nextHref} /> : null}
    </section>
  );
}

function HeroScreen() {
  const t = useTranslations("marketing");
  const tApp = useTranslations("app");
  const { ref, visible } = useSectionReveal(0.15);

  return (
    <ScreenSection
      id="hero"
      sectionRef={ref}
      nextHref="#features"
      className="overflow-hidden"
      style={{
        background:
          "radial-gradient(720px 360px at 18% -10%, color-mix(in srgb, var(--brand) 16%, transparent), transparent), radial-gradient(520px 280px at 88% 12%, color-mix(in srgb, var(--brand) 8%, transparent), transparent)",
      }}
    >
      <Reveal inView={visible} delay={0}>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          {tApp("name")}
        </h1>
      </Reveal>
      <Reveal inView={visible} delay={90}>
        <p className="mt-5 max-w-xl text-base leading-relaxed sm:text-lg">
          {t("heroLine")}
        </p>
      </Reveal>
      <Reveal inView={visible} delay={180}>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-[15px]">
          {t("heroSupport")}
        </p>
      </Reveal>
      <Reveal inView={visible} delay={260}>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/markets"
            className="qt-btn qt-btn-primary h-11 px-5 text-sm"
          >
            {t("ctaEnter")}
          </Link>
          <a href="#features" className="qt-btn qt-btn-ghost h-11 px-5 text-sm">
            {t("ctaStory")}
          </a>
        </div>
      </Reveal>
      <Reveal inView={visible} delay={340}>
        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-[var(--muted)]">
          {t("disclaimerShort")}{" "}
          <Link
            href="/disclaimer"
            className="underline-offset-2 hover:text-[var(--foreground)] hover:underline"
          >
            {t("footerDisclaimer")}
          </Link>
        </p>
      </Reveal>
    </ScreenSection>
  );
}

export function MarketingLanding() {
  useEffect(() => {
    document.documentElement.classList.add("mkt-lock");
    return () => document.documentElement.classList.remove("mkt-lock");
  }, []);

  return (
    <div className="relative">
      <MarketingSectionDots />
      <HeroScreen />
      <MarketingFeatureScreens />
      <MarketingTrustScreen />
      <MarketingStoryScreen />
    </div>
  );
}
