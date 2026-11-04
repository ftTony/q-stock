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
        */}
        <header
          className={`sticky top-0 z-40 box-border flex h-[var(--wb-topbar-h,40px)] shrink-0 items-center border-b border-[var(--border)] backdrop-blur-xl ${
            isSymbol
              ? "bg-[var(--symbol-shell-bg)]/90 lg:hidden"
              : "bg-[var(--background)]/90"
          }`}
        >
          <div
            className={
              isSymbol
                ? "flex h-full min-h-0 w-full items-center gap-2 px-1.5 sm:gap-2 sm:px-2"
                : "flex h-full min-h-0 w-full items-center gap-2 px-3 sm:gap-3 sm:px-5 lg:px-6"
            }
          >
            <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden sm:max-w-[min(52%,36rem)] sm:gap-3 sm:flex-none">
              <a
                href={homeHref}
                className="relative z-10 flex shrink-0 items-center lg:hidden"
                aria-label={t("markets")}
              >
                <SiteLogo height={24} variant="compact" />
              </a>
              {/* Symbol H5: hide index ticker — quote bar under this row is already dense. */}
              <div className={isSymbol ? "hidden min-w-0 lg:block" : "min-w-0"}>
                <TopbarIndexTicker />
              </div>
            </div>
            <div
              className={`relative z-10 ml-auto flex shrink-0 items-center gap-1.5 pl-1.5 ${
                isSymbol
                  ? "bg-[var(--symbol-shell-bg)]"
                  : "bg-[var(--background)]"
              }`}
            >
              <MarketCredentialsPrompt inline />
              {/* H5: theme / lang / account live under 「我的」— desktop only. */}
              <div className="hidden lg:flex lg:items-center">
                <TopBarActions
                  showMarketStatus={false}
                  showTheme
                  showLanguage
                />
              </div>
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
                ? `flex flex-1 flex-col ${isDesktop ? "pb-6" : "pb-24"} ${
                    isStrategies ? "py-0 lg:py-3" : "py-0 lg:py-5"
                  }`
                : isDesktop
                  ? "flex-1 py-5 pb-6 sm:py-6"
                  : "flex-1 py-5 pb-24 sm:py-6"
          }
        >
          <div
            className={
              isSymbol || isFluidMain
                ? `${mainRailClass} flex min-h-0 flex-1 flex-col`
                : mainRailClass
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
