"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { SiteLogo } from "@/components/brand/site-logo";

export const SIDEBAR_WIDTH_EXPANDED = 270;
export const SIDEBAR_WIDTH_COLLAPSED = 72;
const STORAGE_KEY = "qstock-sidebar-collapsed";

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

function IconChevron({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {collapsed ? <path d="M10 6l6 6-6 6" /> : <path d="M14 6l-6 6 6 6" />}
    </svg>
  );
}

function NavItem({
  href,
  active,
  icon,
  label,
  collapsed,
}: {
  href: string;
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      aria-label={label}
      className={`relative flex items-center rounded-xl text-sm transition ${
        collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
      } ${
        active
          ? "bg-[var(--sidebar-active)] text-[var(--brand-text)]"
          : "text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[var(--brand)]" />
      )}
      <span className="opacity-90">{icon}</span>
      {!collapsed && <span className="font-medium">{label}</span>}
    </Link>
  );
}

type Props = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

export function AppSidebar({ collapsed, onCollapsedChange }: Props) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isAnalysis = pathname.startsWith("/analysis");
  const isSymbol = pathname.startsWith("/symbol");
  const isWatchlist = pathname.startsWith("/watchlist");
  const isPortfolio = pathname.startsWith("/portfolio");
  const isAlerts = pathname.startsWith("/alerts");

  const toggleLabel = collapsed ? t("expandSidebar") : t("collapseSidebar");

  return (
    <aside className="flex h-full w-full flex-col border-r border-[var(--border)] bg-[var(--sidebar)]">
      <div
        className={`flex items-center border-b border-[var(--border)] ${
          collapsed ? "flex-col gap-2 px-2 py-3" : "gap-1 pr-2"
        }`}
        style={collapsed ? undefined : { paddingTop: 7, paddingLeft: 12, paddingBottom: 2 }}
      >
        <Link
          href="/"
          className={`min-w-0 ${collapsed ? "" : "flex-1"}`}
          aria-label={t("markets")}
        >
          <SiteLogo
            height={collapsed ? 32 : 40}
            priority
            variant={collapsed ? "mark" : "full"}
          />
        </Link>
        <button
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={toggleLabel}
          title={toggleLabel}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
        >
          <IconChevron collapsed={collapsed} />
        </button>
      </div>

      <div
        className={`qt-scroll flex-1 space-y-6 overflow-y-auto py-4 ${
          collapsed ? "px-2" : "px-3"
        }`}
      >
        <div className="space-y-1">
          {!collapsed && (
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-[var(--muted)] uppercase">
              {t("main")}
            </div>
          )}
          <NavItem
            href="/"
            active={isHome}
            icon={<IconGrid />}
            label={t("markets")}
            collapsed={collapsed}
          />
          <NavItem
            href="/analysis"
            active={isAnalysis || isSymbol}
            icon={<IconChart />}
            label={t("analysis")}
            collapsed={collapsed}
          />
          <NavItem
            href="/watchlist"
            active={isWatchlist}
            icon={<IconStar />}
            label={t("watchlist")}
            collapsed={collapsed}
          />
          <NavItem
            href="/portfolio"
            active={isPortfolio}
            icon={<IconBag />}
            label={t("portfolio")}
            collapsed={collapsed}
          />
          <NavItem
            href="/alerts"
            active={isAlerts}
            icon={<IconBell />}
            label={t("alerts")}
            collapsed={collapsed}
          />
        </div>
      </div>

      <div className={`border-t border-[var(--border)] ${collapsed ? "p-2" : "p-3"}`}>
        <div className={collapsed ? "flex flex-col gap-1.5" : "grid grid-cols-3 gap-1.5"}>
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
}

/** Persist + hydrate sidebar collapse preference (lg only). */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setCollapsed(true);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed, hydrated]);

  return [collapsed, setCollapsed] as const;
}
