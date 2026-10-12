"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { TopBarActions } from "@/components/layout/topbar-actions";
import { SiteLogo } from "@/components/brand/site-logo";

/** Slim chrome for marketing pages: no sidebar / quote socket / credentials. */
export function MarketingAppShell({ children }: { children: React.ReactNode }) {
  const tApp = useTranslations("app");
  const pathname = usePathname();
  const isLandingHome = pathname === "/";
  /** Full-viewport, non-scrolling chrome (coming-soon / short marketing). */
  const isOneScreen =
    pathname === "/tools" ||
    pathname.startsWith("/disclaimer") ||
    pathname.startsWith("/pricing");

  return (
    <div
      className={
        isLandingHome || isOneScreen
          ? "flex h-dvh flex-col overflow-hidden"
          : "flex min-h-dvh flex-col"
      }
    >
      <header className="sticky top-0 z-40 shrink-0 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <SiteLogo height={28} variant="compact" />
            <span
              className="hidden h-3.5 w-px shrink-0 bg-[var(--border)] sm:block"
              aria-hidden
            />
            <span
              className="hidden min-w-0 truncate text-[13px] text-[var(--muted)] sm:inline"
              aria-hidden
            >
              {tApp("tagline")}
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <TopBarActions
              showMarketStatus={false}
              showNotifications={false}
            />
          </div>
        </div>
      </header>
      <main
        className={
          isLandingHome
            ? "mkt-scroll min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto overscroll-y-contain"
            : isOneScreen
              ? "flex min-h-0 flex-1 flex-col overflow-hidden"
              : "flex min-h-0 flex-1 flex-col"
        }
      >
        {children}
      </main>
    </div>
  );
}
