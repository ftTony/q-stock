"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { TopBarActions } from "@/components/layout/topbar-actions";
import { DataSourceBadge } from "@/components/layout/data-source-badge";

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

function IconMenu({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function NavItem({
  href,
  active,
  icon,
  children,
  onClick,
}: {
  href: string;
  active?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
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
  const tApp = useTranslations("app");
  const tMarket = useTranslations("market");
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({ stock: 0, hk: 0, crypto: 0 });

  const isHome = pathname === "/";
  const isAnalysis = pathname.startsWith("/analysis");
  const isSymbol = pathname.startsWith("/symbol");
  const isWatchlist = pathname.startsWith("/watchlist");
  const isPortfolio = pathname.startsWith("/portfolio");
  const isAlerts = pathname.startsWith("/alerts");
  const isSettings = pathname.startsWith("/settings");
  const isAuth = pathname.startsWith("/login") || pathname.startsWith("/register");

  useEffect(() => {
    if (!session?.user) {
      setCounts({ stock: 0, hk: 0, crypto: 0 });
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/watchlist");
      if (!res.ok || cancelled) return;
      const data = await res.json();
      setCounts({
        stock: data.counts?.stock ?? 0,
        hk: data.counts?.hk ?? 0,
        crypto: data.counts?.crypto ?? 0,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [session, pathname]);

  const close = () => setOpen(false);

  const sidebar = (
    <aside className="flex h-full w-[260px] flex-col border-r border-[var(--border)] bg-[var(--sidebar)]">
      <div className="border-b border-[var(--border)] px-5 py-5">
        <Link href="/" onClick={close} className="block">
          <div className="text-lg font-bold tracking-[0.12em] text-[var(--foreground)]">
            {tApp("name").toUpperCase()}
          </div>
          <div className="mt-1 text-[11px] tracking-[0.08em] text-[var(--muted)]">
            {tApp("terminal")}
          </div>
        </Link>
      </div>

      <div className="qt-scroll flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-[var(--muted)] uppercase">
            {t("main")}
          </div>
          <NavItem href="/" active={isHome} icon={<IconGrid />} onClick={close}>
            {t("markets")}
          </NavItem>
          <NavItem
            href="/analysis"
            active={isAnalysis || isSymbol}
            icon={<IconChart />}
            onClick={close}
          >
            {t("analysis")}
          </NavItem>
          <NavItem href="/watchlist" active={isWatchlist} icon={<IconStar />} onClick={close}>
            {t("watchlist")}
          </NavItem>
          <NavItem href="/portfolio" active={isPortfolio} icon={<IconBag />} onClick={close}>
            {t("portfolio")}
          </NavItem>
          <NavItem href="/alerts" active={isAlerts} icon={<IconBell />} onClick={close}>
            {t("alerts")}
          </NavItem>
        </div>

        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-[var(--muted)] uppercase">
            {t("playlists")}
          </div>
          <Link
            href="/watchlist?list=stock"
            onClick={close}
            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
          >
            <span>{tMarket("stocksPlaylist")}</span>
            <span className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-[11px]">
              {counts.stock}
            </span>
          </Link>
          <Link
            href="/watchlist?list=hk"
            onClick={close}
            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
          >
            <span>{tMarket("hkPlaylist")}</span>
            <span className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-[11px]">
              {counts.hk}
            </span>
          </Link>
          <Link
            href="/watchlist?list=crypto"
            onClick={close}
            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
          >
            <span>{tMarket("cryptoPlaylist")}</span>
            <span className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-[11px]">
              {counts.crypto}
            </span>
          </Link>
          <Link
            href="/watchlist"
            onClick={close}
            className="flex items-center rounded-xl px-3 py-2.5 text-sm text-[var(--brand-text)] hover:bg-[var(--sidebar-hover)]"
          >
            + {t("newWatchlist")}
          </Link>
        </div>
      </div>

      <div className="space-y-2 border-t border-[var(--border)] p-3">
        <Link href="/alerts" onClick={close} className="qt-btn qt-btn-primary w-full px-3 py-2.5 text-sm">
          <IconBolt className="h-4 w-4" />
          {t("quickTrade")}
        </Link>
        <NavItem href="/settings" active={isSettings} icon={<IconGear />} onClick={close}>
          {t("settings")}
        </NavItem>
      </div>
    </aside>
  );

  if (isAuth) {
    return (
      <div className="min-h-dvh">
        <div className="mx-auto flex min-h-dvh max-w-lg items-center px-4 py-8">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh lg:flex">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[260px]">{sidebar}</div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            aria-label="Close menu"
            onClick={close}
          />
          <div className="absolute inset-y-0 left-0 shadow-2xl">{sidebar}</div>
        </div>
      )}

      <div className="flex min-h-dvh flex-1 flex-col lg:pl-[260px]">
        <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="qt-btn qt-btn-ghost h-9 w-9 lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <IconMenu />
              </button>
              <nav className="hidden items-center gap-1 text-sm md:flex">
                <Link
                  href="/watchlist"
                  className={`rounded-lg px-3 py-1.5 transition ${
                    isWatchlist
                      ? "bg-[var(--sidebar-active)] font-medium text-[var(--brand-text)]"
                      : "text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {t("watchlist")}
                </Link>
                <Link
                  href="/analysis"
                  className={`rounded-lg px-3 py-1.5 transition ${
                    isAnalysis
                      ? "bg-[var(--sidebar-active)] font-medium text-[var(--brand-text)]"
                      : "text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {t("analysis")}
                </Link>
                <Link
                  href="/portfolio"
                  className={`rounded-lg px-3 py-1.5 transition ${
                    isPortfolio
                      ? "bg-[var(--sidebar-active)] font-medium text-[var(--brand-text)]"
                      : "text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {t("portfolio")}
                </Link>
                <Link
                  href="/alerts"
                  className={`rounded-lg px-3 py-1.5 transition ${
                    isAlerts
                      ? "bg-[var(--sidebar-active)] font-medium text-[var(--brand-text)]"
                      : "text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {t("alerts")}
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <TopBarActions />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:pb-6">{children}</main>

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
