"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
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

function isMarketingPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/disclaimer") ||
    pathname.startsWith("/learn") ||
    pathname.startsWith("/tools")
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const tM = useTranslations("marketing");
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useSidebarCollapsed();

  const isMarkets = pathname === "/markets" || pathname.startsWith("/markets/");
  const isWatchlist = pathname.startsWith("/watchlist");
  const isPortfolio = pathname.startsWith("/portfolio");
  const isAlerts = pathname.startsWith("/alerts");
  const isAuth =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/auth/");
  const isMarketing = isMarketingPath(pathname);

  const sidebarWidth = collapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_EXPANDED;

  if (isAuth) {
    return (
      <div className="min-h-dvh">
        <div className="mx-auto flex min-h-dvh max-w-lg items-center px-4 py-8">
          {children}
        </div>
      </div>
    );
  }

  if (isMarketing) {
    const isLandingHome = pathname === "/";
    return (
      <div
        className={
          isLandingHome
            ? "flex h-dvh flex-col overflow-hidden"
            : "min-h-dvh"
        }
      >
        <header className="sticky top-0 z-40 shrink-0 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
            <Link href="/" className="flex shrink-0 items-center">
              <SiteLogo height={28} variant="compact" />
            </Link>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Link
                href="/markets"
                className="qt-btn qt-btn-primary h-9 px-3 text-xs"
              >
                {tM("ctaEnter")}
              </Link>
              <TopBarActions />
            </div>
          </div>
        </header>
        <main
          className={
            isLandingHome
              ? "mkt-scroll min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto overscroll-y-contain"
              : "flex-1"
          }
        >
          {children}
        </main>
      </div>
    );
  }

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
              <Link href="/markets" className="flex shrink-0 items-center lg:hidden">
                <SiteLogo height={28} variant="compact" />
              </Link>
              <TopbarIndexTicker />
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <TopBarActions />
            </div>
          </div>
        </header>

        <MarketCredentialsPrompt />

        <main className="flex-1 px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:pb-6">
          {children}
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
