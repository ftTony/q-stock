"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
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

function IconChart({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 15l3-4 3 2 4-6" />
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

function IconGear({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

function IconBolt({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2 4 14h6l-1 8 10-13h-6l1-7z" />
    </svg>
  );
}

function IconUser({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c1.8-3.2 4.2-4.5 7-4.5s5.2 1.3 7 4.5" />
    </svg>
  );
}

function NavItem({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
        active
          ? "bg-[var(--sidebar-active)] text-[var(--brand-text)]"
          : "text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[var(--brand)]" />
      )}
      <span className="opacity-90">{icon}</span>
      <span className="font-medium">{children}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isAnalysis = pathname.startsWith("/analysis");
  const isSymbol = pathname.startsWith("/symbol");
  const isWatchlist = pathname.startsWith("/watchlist");
  const isPortfolio = pathname.startsWith("/portfolio");
  const isAlerts = pathname.startsWith("/alerts");
  const isAuth =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/auth/");

  const sidebar = (
    <aside className="flex h-full w-[270px] flex-col border-r border-[var(--border)] bg-[var(--sidebar)]">
      <div
        className="border-b border-[var(--border)] pr-3 pb-3"
        style={{ paddingTop: 7, paddingLeft: 16, paddingBottom: 2 }}
      >
        <Link href="/" className="block">
          <SiteLogo height={40} priority variant="full" />
        </Link>
      </div>

      <div className="qt-scroll flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-[var(--muted)] uppercase">
            {t("main")}
          </div>
          <NavItem href="/" active={isHome} icon={<IconGrid />}>
            {t("markets")}
          </NavItem>
          <NavItem href="/analysis" active={isAnalysis || isSymbol} icon={<IconChart />}>
            {t("analysis")}
          </NavItem>
          <NavItem href="/watchlist" active={isWatchlist} icon={<IconStar />}>
            {t("watchlist")}
          </NavItem>
          <NavItem href="/portfolio" active={isPortfolio} icon={<IconBag />}>
            {t("portfolio")}
          </NavItem>
          <NavItem href="/alerts" active={isAlerts} icon={<IconBell />}>
            {t("alerts")}
          </NavItem>
        </div>
      </div>

      <div className="border-t border-[var(--border)] p-3">
        <div className="grid grid-cols-3 gap-1.5">
          <Link
            href="/alerts"
            aria-label={t("quickTrade")}
            title={t("quickTrade")}
            className="qt-btn qt-btn-primary flex h-9 items-center justify-center rounded-lg"
          >
            <IconBolt className="h-4 w-4" />
          </Link>
          <Link
            href="/settings"
            aria-label={t("settings")}
            title={t("settings")}
            className="qt-btn qt-btn-ghost flex h-9 items-center justify-center rounded-lg border border-[var(--border)]"
          >
            <IconGear className="h-4 w-4" />
          </Link>
          <Link
            href="/about"
            aria-label={t("about")}
            title={t("about")}
            className="qt-btn qt-btn-ghost flex h-9 items-center justify-center rounded-lg border border-[var(--border)]"
          >
            <IconUser className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );

  if (isAuth) {
    return (
      <div className="min-h-dvh">
        <div className="mx-auto flex min-h-dvh max-w-lg items-center px-4 py-8">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh lg:flex">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[270px]">{sidebar}</div>

      <div className="flex min-h-dvh flex-1 flex-col lg:pl-[270px]">
        <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Link href="/" className="flex shrink-0 items-center lg:hidden">
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
              href="/"
              className={`flex flex-col items-center gap-1 rounded-lg py-2 ${isHome ? "text-[var(--brand-text)]" : "text-[var(--muted)]"}`}
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
