"use client";

import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { localizedPath } from "@/i18n/config";
import {
  AppSidebar,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
  useSidebarCollapsed,
} from "@/components/layout/app-sidebar";
import { TopBarActions } from "@/components/layout/topbar-actions";
import { TopbarIndexTicker } from "@/components/layout/topbar-index-ticker";
import { DataSourceBadge } from "@/components/layout/data-source-badge";
import { MarketCredentialsPrompt } from "@/components/settings/market-credentials-prompt";
import { SiteLogo } from "@/components/brand/site-logo";
import { useMounted } from "@/hooks/use-mounted";

function IconGrid({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconStar({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8L6.7 19.6l1-6L3.4 9.4l6-.9L12 3z" />
    </svg>
  );
}

function IconBell({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

function IconBag({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16v12H4z" />
      <path d="M8 7V5h8v2" />
      <path d="M8 12h8M8 16h5" />
    </svg>
  );
}

/** App chrome with sidebar, quote ticker, credentials. Loaded only off marketing. */
export function MainAppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const homeHref = localizedPath(locale, "/");
  const { status: sessionStatus } = useSession();
  const mounted = useMounted();
  const [collapsed, setCollapsed] = useSidebarCollapsed();

  const isMarkets = pathname === "/markets" || pathname.startsWith("/markets/");
  const isWatchlist = pathname.startsWith("/watchlist");
  const isPortfolio = pathname.startsWith("/portfolio");
  const isAlerts = pathname.startsWith("/alerts");
  const isReview = pathname.startsWith("/review");
  const isAccountGatePage = isWatchlist || isAlerts || isReview;
  // Session status often differs SSR ("loading") vs client ("authenticated").
  // Keep the pre-mount layout identical to SSR, then tighten after mount.
  const authed = mounted && sessionStatus === "authenticated";
  const isFluidMain =
    isMarkets ||
    isPortfolio ||
    pathname.startsWith("/analysis") ||
    pathname.startsWith("/symbol") ||
    (isAccountGatePage && !authed);
  const mainRailClass = isFluidMain
    ? "w-full px-4 sm:px-6"
    : "mx-auto w-full max-w-6xl px-4 sm:px-6";
  // Width must match SSR (collapsed=false) until localStorage is read.
  const sidebarWidth =
    mounted && collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <div
      className="min-h-dvh lg:flex"
      style={{ ["--sidebar-w" as string]: `${sidebarWidth}px` }}
    >
      <div
        className="hidden shrink-0 transition-[width] duration-200 ease-out lg:sticky lg:top-0 lg:flex lg:h-dvh lg:self-start"
        style={{ width: sidebarWidth }}
      >
        <AppSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
      </div>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <a
                href={homeHref}
                className="relative z-10 flex shrink-0 items-center lg:hidden"
              >
                <SiteLogo height={28} variant="compact" />
              </a>
              <TopbarIndexTicker />
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <TopBarActions />
            </div>
          </div>
        </header>

        <MarketCredentialsPrompt fluid={isFluidMain} />

        <main className="flex-1 py-5 pb-24 sm:py-6 lg:pb-6">
          <div className={mainRailClass}>{children}</div>
        </main>

        <DataSourceBadge />

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--sidebar)]/95 backdrop-blur-xl lg:hidden">
          <div className="grid grid-cols-4 gap-1 px-2 py-2 text-[11px]">
            <Link
              href="/markets"
              className={`flex flex-col items-center gap-1 rounded-lg py-2 ${isMarkets ? "text-[var(--brand-text)]" : "text-[var(--muted)]"}`}
            >
              <IconGrid />
              {t("markets")}
            </Link>
            <Link
              href="/watchlist"
              className={`flex flex-col items-center gap-1 rounded-lg py-2 ${isWatchlist ? "text-[var(--brand-text)]" : "text-[var(--muted)]"}`}
            >
              <IconStar />
              {t("watchlist")}
            </Link>
            <Link
              href="/alerts"
              className={`flex flex-col items-center gap-1 rounded-lg py-2 ${isAlerts ? "text-[var(--brand-text)]" : "text-[var(--muted)]"}`}
            >
              <IconBell />
              {t("alerts")}
            </Link>
            <Link
              href="/portfolio"
              className={`flex flex-col items-center gap-1 rounded-lg py-2 ${isPortfolio ? "text-[var(--brand-text)]" : "text-[var(--muted)]"}`}
            >
              <IconBag />
              {t("portfolio")}
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
