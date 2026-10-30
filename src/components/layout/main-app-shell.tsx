"use client";

import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { localizedPath } from "@/i18n/config";
import {
  AppSidebar,
  SIDEBAR_WIDTH_COLLAPSED,
} from "@/components/layout/app-sidebar";
import { TopBarActions } from "@/components/layout/topbar-actions";
import { TopbarIndexTicker } from "@/components/layout/topbar-index-ticker";
import { DataSourceBadge } from "@/components/layout/data-source-badge";
import { MarketCredentialsPrompt } from "@/components/settings/market-credentials-prompt";
import { SettingsModalHost } from "@/components/settings/settings-modal-host";
import { SiteLogo } from "@/components/brand/site-logo";
import { SpotlightTour } from "@/components/onboarding/spotlight-tour";
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

function IconLab({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 3v7.2L4.8 18.5A1.8 1.8 0 0 0 6.4 21h11.2a1.8 1.8 0 0 0 1.6-2.5L15 10.2V3" />
      <path d="M8.5 3h7" strokeLinecap="round" />
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

/**
 * Mobile: logo + index + account chrome on top; main tabs on bottom.
 * Desktop: left sidebar nav; top bar keeps index + account chrome.
 */
export function MainAppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const homeHref = localizedPath(locale, "/");
  const { status: sessionStatus } = useSession();
  const mounted = useMounted();

  const isMarkets = pathname === "/markets" || pathname.startsWith("/markets/");
  const isWatchlist = pathname.startsWith("/watchlist");
  const isReview = pathname.startsWith("/review");
  const isPortfolio = pathname.startsWith("/portfolio");
  const isStrategiesNav = pathname.startsWith("/strategies");
  const isAccountGatePage = isWatchlist || isReview;
  // Session status often differs SSR ("loading") vs client ("authenticated").
  // Keep the pre-mount layout identical to SSR, then tighten after mount.
  const authed = mounted && sessionStatus === "authenticated";
  const isFluidMain =
    isMarkets ||
    isPortfolio ||
    pathname.startsWith("/analysis") ||
    pathname.startsWith("/symbol") ||
    pathname.startsWith("/multi-chart") ||
    pathname.startsWith("/strategies") ||
    (isAccountGatePage && !authed);
  const isSymbol = pathname.startsWith("/symbol");
  const isStrategies = pathname.startsWith("/strategies");
  const mainRailClass = isFluidMain
    ? isSymbol
      ? "w-full px-0"
      : isStrategies
        ? "w-full px-3 sm:px-4"
        : "w-full px-4 sm:px-6"
    : "mx-auto w-full max-w-6xl px-4 sm:px-6";
  const sidebarWidth = SIDEBAR_WIDTH_COLLAPSED;

  return (
    <SettingsModalHost>
      {isSymbol ? null : <SpotlightTour forceShow={false} />}
      <div
        className={
          isSymbol
            ? "wb-shell flex h-dvh overflow-hidden bg-[var(--symbol-shell-bg)] lg:flex"
            : "wb-shell min-h-dvh lg:flex"
        }
        style={{ ["--sidebar-w" as string]: `${sidebarWidth}px` }}
      >
      <div
        className="hidden shrink-0 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:self-start"
        style={{ width: sidebarWidth }}
      >
        <AppSidebar />
      </div>

      <div
        className={
          isSymbol
            ? "flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--symbol-shell-bg)]"
            : "flex min-h-dvh min-w-0 flex-1 flex-col bg-[var(--background)]"
        }
      >
        <header
          className={`sticky top-0 z-40 shrink-0 border-b border-[var(--border)] backdrop-blur-xl ${
            isSymbol
              ? "bg-[var(--symbol-shell-bg)]/90"
              : "bg-[var(--background)]/90"
          }`}
        >
          <div
            className={
              isSymbol
                ? "flex h-10 items-center gap-2 px-1.5 sm:gap-2 sm:px-2"
                : "flex h-10 items-center gap-2 px-3 sm:gap-3 sm:px-5 lg:px-6"
            }
          >
            <div className="flex min-w-0 shrink-0 items-center gap-2 sm:max-w-[min(42%,28rem)] sm:gap-3">
              <a
                href={homeHref}
                className="relative z-10 flex shrink-0 items-center lg:hidden"
              >
                <SiteLogo height={24} variant="compact" />
              </a>
              {/* Symbol H5: hide index ticker — quote bar under this row is already dense. */}
              <div className={isSymbol ? "hidden min-w-0 lg:block" : "min-w-0"}>
                <TopbarIndexTicker />
              </div>
            </div>
            <MarketCredentialsPrompt inline />
            <div className="ml-auto flex shrink-0 items-center">
              <TopBarActions
                showMarketStatus={false}
                showTheme
                showLanguage
              />
            </div>
          </div>
        </header>

        <main
          className={
            isSymbol
              ? "flex min-h-0 flex-1 flex-col overflow-hidden pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0"
              : `flex-1 pb-24 lg:pb-6 ${
                  isStrategies ? "py-3 sm:py-3.5" : "py-5 sm:py-6"
                }`
          }
        >
          <div
            className={
              isSymbol
                ? `${mainRailClass} flex min-h-0 flex-1 flex-col`
                : mainRailClass
            }
          >
            {children}
          </div>
        </main>

        <DataSourceBadge />

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--sidebar)]/95 backdrop-blur-xl lg:hidden">
          <div className="grid grid-cols-4 gap-1 px-2 py-2 text-[11px]">
            <Link
              href="/markets"
              data-tour="nav-watchlist"
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
              href="/portfolio"
              data-tour="nav-portfolio"
              className={`flex flex-col items-center gap-1 rounded-lg py-2 ${isPortfolio ? "text-[var(--brand-text)]" : "text-[var(--muted)]"}`}
            >
              <IconBag />
              {t("portfolio")}
            </Link>
            <Link
              href="/strategies"
              className={`flex flex-col items-center gap-1 rounded-lg py-2 ${isStrategiesNav ? "text-[var(--brand-text)]" : "text-[var(--muted)]"}`}
            >
              <IconLab />
              {t("strategies")}
            </Link>
          </div>
        </nav>
      </div>
      </div>
    </SettingsModalHost>
  );
}
