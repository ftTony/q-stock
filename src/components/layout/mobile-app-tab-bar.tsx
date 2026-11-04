"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

const ICON = "h-4 w-4";

function IconGrid({ className = ICON }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconStar({ className = ICON }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8L6.7 19.6l1-6L3.4 9.4l6-.9L12 3z" />
    </svg>
  );
}

function IconLab({ className = ICON }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 3v7.2L4.8 18.5A1.8 1.8 0 0 0 6.4 21h11.2a1.8 1.8 0 0 0 1.6-2.5L15 10.2V3" />
      <path d="M8.5 3h7" strokeLinecap="round" />
    </svg>
  );
}

function IconBag({ className = ICON }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16v12H4z" />
      <path d="M8 7V5h8v2" />
      <path d="M8 12h8M8 16h5" />
    </svg>
  );
}

function IconMine({ className = ICON }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19.5c1.8-3.2 4.2-4.5 7-4.5s5.2 1.3 7 4.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * H5-only bottom tab bar. Never mount on desktop — web uses AppSidebar.
 * Icon + label; omit on symbol pages (caller gates).
 */
export function MobileAppTabBar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const isMarkets = pathname === "/markets" || pathname.startsWith("/markets/");
  const isWatchlist = pathname.startsWith("/watchlist");
  const isPortfolio = pathname.startsWith("/portfolio");
  const isStrategiesNav = pathname.startsWith("/strategies");
  const isMine = pathname === "/mine" || pathname.startsWith("/mine/");

  const item = (active: boolean) =>
    `flex flex-col items-center gap-0.5 rounded-none py-2 transition-colors ${
      active
        ? "font-semibold text-[var(--brand)]"
        : "font-normal text-[var(--muted)]"
    }`;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--sidebar)]/95 backdrop-blur-xl lg:hidden"
      aria-label={t("main")}
    >
      <div
        className="grid grid-cols-5 gap-0.5 px-1 pb-[env(safe-area-inset-bottom,0px)] pt-1 text-[10px] leading-tight"
        role="tablist"
      >
        <Link
          href="/markets"
          data-tour="nav-watchlist"
          aria-current={isMarkets ? "page" : undefined}
          className={item(isMarkets)}
        >
          <IconGrid />
          {t("markets")}
        </Link>
        <Link
          href="/watchlist"
          aria-current={isWatchlist ? "page" : undefined}
          className={item(isWatchlist)}
        >
          <IconStar />
          {t("watchlist")}
        </Link>
        <Link
          href="/portfolio"
          data-tour="nav-portfolio"
          aria-current={isPortfolio ? "page" : undefined}
          className={item(isPortfolio)}
        >
          <IconBag />
          {t("portfolio")}
        </Link>
        <Link
          href="/strategies"
          aria-current={isStrategiesNav ? "page" : undefined}
          className={item(isStrategiesNav)}
        >
          <IconLab />
          {t("strategies")}
        </Link>
        <Link
          href="/mine"
          aria-current={isMine ? "page" : undefined}
          className={item(isMine)}
        >
          <IconMine />
          {t("mine")}
        </Link>
      </div>
    </nav>
  );
}
