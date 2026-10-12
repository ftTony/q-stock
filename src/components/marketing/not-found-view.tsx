import { Link } from "@/i18n/routing";
import NextLink from "next/link";
import { MarketingCtaBand } from "@/components/marketing/marketing-cta-band";

type Props = {
  code?: string;
  title: string;
  body: string;
  homeLabel: string;
  marketsLabel: string;
  ctaEnter: string;
  brandName: string;
  /**
   * Root not-found (no next-intl / marketing shell): own header + no CTA band.
   * Locale 404 uses MarketingAppShell header + MarketingCtaBand footer.
   */
  plainLinks?: boolean;
};

const LOGO_SRC = "/logo-light.png?v=2";

function BrandMark({ name }: { name: string }) {
  return (
    <span
      className="inline-flex min-w-0 items-center gap-2.5"
      aria-label={name}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_SRC}
        alt=""
        width={28}
        height={28}
        decoding="async"
        className="h-7 w-7 shrink-0 object-contain"
      />
      <span className="truncate text-base font-bold tracking-tight text-[var(--foreground)]">
        {name}
      </span>
    </span>
  );
}

/** 404 body; locale pages rely on MarketingAppShell + CTA footer. */
export function NotFoundView({
  code = "404",
  title,
  body,
  homeLabel,
  marketsLabel,
  ctaEnter,
  brandName,
  plainLinks = false,
}: Props) {
  const homeClass =
    "qt-btn qt-btn-ghost inline-flex h-11 items-center justify-center px-5 text-sm";
  const marketsClass =
    "qt-btn qt-btn-primary inline-flex h-11 items-center justify-center px-5 text-sm";

  const logo = <BrandMark name={brandName} />;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {plainLinks ? (
        <header className="sticky top-0 z-10 shrink-0 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
            <NextLink href="/" className="flex shrink-0 items-center">
              {logo}
            </NextLink>
            <NextLink
              href="/markets"
              className="qt-btn qt-btn-primary h-9 px-3 text-xs"
            >
              {ctaEnter}
            </NextLink>
          </div>
        </header>
      ) : null}

      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <p
          className="select-none text-[clamp(5.5rem,18vw,9rem)] font-semibold leading-none tracking-tight"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--brand) 45%, transparent), color-mix(in srgb, var(--brand-text) 14%, transparent))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
          aria-hidden
        >
          {code}
        </p>

        <div className="mt-2 max-w-lg space-y-3 animate-[qtFade_0.45s_ease]">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            {title}
          </h1>
          <p className="text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            {body}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-4">
            {plainLinks ? (
              <>
                <NextLink href="/markets" className={marketsClass}>
                  {marketsLabel}
                </NextLink>
                <NextLink href="/" className={homeClass}>
                  {homeLabel}
                </NextLink>
              </>
            ) : (
              <>
                <Link href="/markets" className={marketsClass}>
                  {marketsLabel}
                </Link>
                <Link href="/" className={homeClass}>
                  {homeLabel}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {plainLinks ? null : <MarketingCtaBand />}
    </div>
  );
}
