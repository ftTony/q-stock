"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { TopBarActions } from "@/components/layout/topbar-actions";
import { SiteLogo } from "@/components/brand/site-logo";
import { MARKETING_SHELL_WIDTH } from "@/components/marketing/marketing-width";

const MARKETING_LINKS = [
  { href: "/markets" as const, labelKey: "markets" as const },
  { href: "/tools" as const, labelKey: "tools" as const },
  { href: "/learn" as const, labelKey: "learn" as const },
  { href: "/pricing" as const, labelKey: "pricing" as const },
];

/** Slim chrome for marketing pages: no sidebar / quote socket / credentials. */
export function MarketingAppShell({ children }: { children: React.ReactNode }) {
  const tApp = useTranslations("app");
  const tNav = useTranslations("nav");
  const pathname = usePathname();
  const isLandingHome = pathname === "/";
  /** Full-viewport chrome for short pages only (pricing scrolls — too tall for one screen). */
  const isOneScreen = pathname.startsWith("/disclaimer");

  function linkActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div
      className={
        isLandingHome || isOneScreen
          ? "flex h-dvh flex-col overflow-hidden"
          : "flex min-h-dvh flex-col"
      }
    >
      <header className="sticky top-0 z-40 shrink-0 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-xl">
        <div
          className={`flex h-14 items-center gap-3 sm:gap-4 ${MARKETING_SHELL_WIDTH}`}
        >
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3">
            <SiteLogo height={28} variant="compact" />
            <span
              className="hidden h-3.5 w-px shrink-0 bg-[var(--border)] xl:block"
              aria-hidden
            />
            <span
              className="hidden min-w-0 max-w-[16rem] truncate text-[11px] leading-none text-[var(--muted)] xl:inline"
              aria-hidden
            >
              {tApp("tagline")}
            </span>
          </Link>

          <nav
            aria-label={tNav("main")}
            className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex lg:gap-2"
          >
            {MARKETING_LINKS.map((item) => {
              const active = linkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 py-1.5 text-[13px] transition lg:px-3 ${
                    active
                      ? "font-semibold text-[var(--foreground)]"
                      : "font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {tNav(item.labelKey)}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
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
