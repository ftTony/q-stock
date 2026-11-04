"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/routing";
import { localizedPath } from "@/i18n/config";
import {
  AppSidebar,
  SIDEBAR_WIDTH_COLLAPSED,
} from "@/components/layout/app-sidebar";
import { TopBarActions } from "@/components/layout/topbar-actions";
import { TopbarIndexTicker } from "@/components/layout/topbar-index-ticker";
import { DataSourceBadge } from "@/components/layout/data-source-badge";
import { MobileAppTabBar } from "@/components/layout/mobile-app-tab-bar";
import { MarketCredentialsPrompt } from "@/components/settings/market-credentials-prompt";
import { SettingsModalHost } from "@/components/settings/settings-modal-host";
import { SiteLogo } from "@/components/brand/site-logo";
import { SpotlightTour } from "@/components/onboarding/spotlight-tour";
import { LG_MIN, useMinWidth } from "@/hooks/use-min-width";

/**
 * Mobile: logo + index + account chrome on top; main tabs on bottom.
 * Desktop: left sidebar nav; top bar keeps index + account chrome.
 * H5 tab-bar changes must not alter desktop sidebar / gutters.
 */
export function MainAppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const homeHref = localizedPath(locale, "/");
  const isDesktop = useMinWidth(LG_MIN);

  const isMarkets = pathname === "/markets" || pathname.startsWith("/markets/");
  const isSymbol = pathname.startsWith("/symbol");
  const isStrategies = pathname.startsWith("/strategies");
  /** Fluid pages: H5 full-bleed; desktop keeps prior side gutters. */
  const isFluidMain =
    isMarkets ||
    pathname.startsWith("/watchlist") ||
    pathname.startsWith("/review") ||
    pathname.startsWith("/portfolio") ||
    isStrategies ||
    pathname.startsWith("/analysis") ||
    pathname.startsWith("/symbol") ||
    pathname.startsWith("/multi-chart") ||
    pathname.startsWith("/alerts") ||
    pathname.startsWith("/mine");
  const mainRailClass = isFluidMain
    ? isSymbol
      ? "w-full px-0"
      : isStrategies
        ? "w-full px-0 lg:px-3"
        : "w-full px-0 lg:px-4 xl:px-6"
    : "mx-auto w-full max-w-6xl px-4 sm:px-6";
  const sidebarWidth = SIDEBAR_WIDTH_COLLAPSED;

  // H5 tab bar only — never on desktop web; never on symbol (height).
  const showMobileTabBar = !isDesktop && !isSymbol;

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
        {/*
          Symbol desktop: topbar lives beside 自选 in SymbolWorkbenchTopbar
          so Logo | 自选 | indices share one hairline. Keep shell header on H5.
          Do not put overflow-x-hidden on this column — it breaks position:sticky.
        */}
        <header
          className={`sticky top-0 z-40 box-border flex h-[var(--wb-topbar-h,40px)] shrink-0 items-center border-b border-[var(--border)] ${
            isSymbol
              ? "bg-[var(--symbol-shell-bg)] lg:hidden"
              : "bg-[var(--background)]"
          }`}
        >
          <div
            className={
              isSymbol
                ? "flex h-full min-h-0 w-full min-w-0 items-center gap-2 px-1.5 sm:gap-2 sm:px-2"
                : "flex h-full min-h-0 w-full min-w-0 items-center gap-2 px-3 sm:gap-3 sm:px-5 lg:px-6"
            }
          >
            {/* Indices — H5: full triple + logo, no clip; desktop may shrink before actions. */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3 lg:min-w-0 lg:max-w-[min(40%,26rem)] lg:shrink lg:overflow-hidden">
              <a
                href={homeHref}
                className="relative z-10 flex shrink-0 items-center lg:hidden"
                aria-label={t("markets")}
              >
                <SiteLogo height={24} variant="compact" />
              </a>
              {/* Symbol shell header is lg:hidden — H5 shows the same triple as markets. */}
              <div className="shrink-0">
                <TopbarIndexTicker />
              </div>
            </div>
            {/* Credentials marquee — fills leftover; truncates before actions. */}
            <div
              className={`relative z-10 min-w-0 flex-1 overflow-hidden pl-1.5 ${
                isSymbol
                  ? "bg-[var(--symbol-shell-bg)]"
                  : "bg-[var(--background)]"
              }`}
            >
              <MarketCredentialsPrompt inline />
            </div>
            {/* Desktop chrome — always visible; H5 uses 「我的」. */}
            <div className="relative z-10 hidden shrink-0 items-center bg-[var(--background)] pl-1 lg:flex">
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
              ? isDesktop
                ? "flex min-h-0 flex-1 flex-col overflow-hidden"
                : "flex min-h-0 flex-1 flex-col overflow-hidden pb-[env(safe-area-inset-bottom,0px)]"
              : isFluidMain
                ? // pb-24 only under lg — matches MobileAppTabBar `lg:hidden` (CSS wins over JS).
                  `min-w-0 flex-1 flex-col overflow-x-clip pb-24 lg:pb-6 ${
                    isStrategies ? "py-0 lg:py-3" : "py-0 lg:py-5"
                  }`
                : "min-w-0 flex-1 overflow-x-clip py-5 pb-24 sm:py-6 lg:pb-6"
          }
        >
          <div
            className={
              isSymbol || isFluidMain
                ? `${mainRailClass} flex min-h-0 min-w-0 flex-1 flex-col`
                : `${mainRailClass} min-w-0`
            }
          >
            {children}
          </div>
        </main>

        <DataSourceBadge />

        {showMobileTabBar ? <MobileAppTabBar /> : null}
      </div>
      </div>
    </SettingsModalHost>
  );
}
