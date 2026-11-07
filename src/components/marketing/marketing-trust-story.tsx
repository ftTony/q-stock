import { getTranslations } from "next-intl/server";
import type { CSSProperties, ReactNode } from "react";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";
import { Reveal } from "@/components/marketing/reveal";

const TRUST_KEYS = ["learnOnly", "dataBound", "calm", "privacy"] as const;

const TRUST_INDEX: Record<(typeof TRUST_KEYS)[number], string> = {
  learnOnly: "01",
  dataBound: "02",
  calm: "03",
  privacy: "04",
};

const SCREEN =
  "relative flex min-h-[calc(100dvh-3.5rem)] snap-start snap-always flex-col justify-center pb-20 pt-12";

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
  nextHref,
  nextLabel,
  children,
  style,
}: {
  id: string;
  nextHref?: string;
  nextLabel?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section id={id} className={SCREEN} style={style}>
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">{children}</div>
      {nextHref ? (
        <ScrollHint href={nextHref} label={nextLabel ?? ""} />
      ) : null}
    </section>
  );
}

/** 「为何可信」屏：服务端组件。 */
export async function MarketingTrustScreen() {
  const t = await getTranslations("marketing");

  return (
    <ScreenShell id="trust" nextHref="#story" nextLabel={t("scrollNext")}>
      <Reveal>
        <p className="text-xs font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">
          {t("trustEyebrow")}
        </p>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
          {t("trustTitle")}
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {TRUST_KEYS.map((key, i) => (
          <Reveal key={key} delay={140 + i * 80} className="h-full">
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

/** 「缘起」屏 + CTA 带：服务端组件（CTA 按钮仍是客户端组件）。 */
export async function MarketingStoryScreen() {
  const t = await getTranslations("marketing");

  return (
    <section
      id="story"
      className="relative flex min-h-[calc(100dvh-3.5rem)] snap-start snap-always flex-col pb-0 pt-12"
      style={{
        background: "color-mix(in srgb, var(--panel) 40%, transparent)",
      }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 sm:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
          <div>
            <Reveal>
              <p className="text-xs font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">
                {t("storyEyebrow")}
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                {t("storyTitle")}
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-5 text-sm leading-relaxed sm:text-base">
                {t("storyP1")}
              </p>
            </Reveal>
            <Reveal delay={220}>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                {t("storyP2")}
              </p>
            </Reveal>
          </div>

          <Reveal delay={180}>
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

      <div className="mt-10 shrink-0">
        <MarketingCtaBand />
      </div>
    </section>
  );
}
