"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { localizedPath } from "@/i18n/config";
import { SiteLogo } from "@/components/brand/site-logo";

/** Icon-rail width (product chrome — always compact). */
export const SIDEBAR_WIDTH_EXPANDED = 56;
export const SIDEBAR_WIDTH_COLLAPSED = 56;

function IconGrid({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconChart({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 19V5" strokeLinecap="round" />
      <path d="M4 19h16" strokeLinecap="round" />
      <path d="M8 15l3.2-4 2.8 2.2L18 8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBag({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8z" />
      <path d="M8 8V6.5A1.5 1.5 0 0 1 9.5 5h5A1.5 1.5 0 0 1 16 6.5V8" />
      <path d="M10 13h4" strokeLinecap="round" />
    </svg>
  );
}

function IconDoc({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="6" y="3.5" width="12" height="17" rx="2" />
      <path d="M9 9h6M9 12.5h6M9 16h4" strokeLinecap="round" />
    </svg>
  );
}

function IconStar({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3.5l2.4 5 5.5.8-4 3.9.9 5.5L12 16.5 7.2 18.7l.9-5.5-4-3.9 5.5-.8L12 3.5z" strokeLinejoin="round" />
    </svg>
  );
}

function IconBell({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 6.5 2.5 6.5 2.5 6.5H4s2.5 0 2.5-6.5" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  );
}

function IconLab({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M9 3v7.2L4.8 18.5A1.8 1.8 0 0 0 6.4 21h11.2a1.8 1.8 0 0 0 1.6-2.5L15 10.2V3" />
      <path d="M8.5 3h7" strokeLinecap="round" />
    </svg>
  );
}

function IconGear({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6.2 6.2l1.6 1.6M16.2 16.2l1.6 1.6M17.8 6.2l-1.6 1.6M7.8 16.2l-1.6 1.6" strokeLinecap="round" />
    </svg>
  );
}

function RailItem({
  href,
  active,
  icon,
  label,
  onNavigate,
  hard,
}: {
  href: string;
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onNavigate?: () => void;
  /** Full page navigation (marketing/home). */
  hard?: boolean;
}) {
  const className = `flex h-10 w-10 items-center justify-center rounded-lg transition ${
    active
      ? "bg-[var(--sidebar-active)] text-[var(--brand-text)]"
      : "text-[color-mix(in_srgb,var(--muted)_88%,transparent)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
  }`;

  if (hard) {
    return (
      <a href={href} title={label} aria-label={label} className={className}>
        {icon}
      </a>
    );
  }

  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      onClick={onNavigate}
      className={className}
    >
      {icon}
    </Link>
  );
}

type Props = {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onNavigate?: () => void;
  showCollapse?: boolean;
};

/** Desktop product chrome: always a narrow icon rail (mockup-aligned). */
export function AppSidebar({ onNavigate }: Props) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const homeHref = localizedPath(locale, "/");

  const isMarkets = pathname === "/markets" || pathname.startsWith("/markets/");
  const isAnalysis = pathname.startsWith("/analysis") || pathname.startsWith("/symbol");
  const isWatchlist = pathname.startsWith("/watchlist");
  const isPortfolio = pathname.startsWith("/portfolio");
  const isReview = pathname.startsWith("/review");
  const isStrategies = pathname.startsWith("/strategies");
  const isAlerts = pathname.startsWith("/alerts");
  const isSettings = pathname.startsWith("/settings");

  return (
    <aside className="flex h-full w-full flex-col border-r border-[var(--border)] bg-[var(--sidebar)]">
      <div className="flex items-center justify-center border-b border-[var(--border)] py-3">
        <a href={homeHref} className="relative z-10" aria-label={t("markets")}>
          <SiteLogo height={28} priority variant="mark" />
        </a>
      </div>

      <nav className="qt-scroll flex flex-1 flex-col items-center gap-1.5 overflow-y-auto px-1.5 py-3">
        <RailItem
          href="/markets"
          active={isMarkets}
          icon={<IconGrid />}
          label={t("markets")}
          onNavigate={onNavigate}
        />
        <RailItem
          href="/analysis"
          active={isAnalysis}
          icon={<IconChart />}
          label={t("analysis")}
          onNavigate={onNavigate}
        />
        <RailItem
          href="/portfolio"
          active={isPortfolio}
          icon={<IconBag />}
          label={t("portfolio")}
          onNavigate={onNavigate}
        />
        <RailItem
          href="/review"
          active={isReview}
          icon={<IconDoc />}
          label={t("review")}
          onNavigate={onNavigate}
        />
        <RailItem
          href="/watchlist"
          active={isWatchlist}
          icon={<IconStar />}
          label={t("watchlist")}
          onNavigate={onNavigate}
        />
        <RailItem
          href="/alerts"
          active={isAlerts}
          icon={<IconBell />}
          label={t("alerts")}
          onNavigate={onNavigate}
        />
        <RailItem
          href="/strategies"
          active={isStrategies}
          icon={<IconLab />}
          label={t("strategies")}
          onNavigate={onNavigate}
        />
      </nav>

      <div className="flex flex-col items-center gap-1.5 border-t border-[var(--border)] px-1.5 py-3">
        <RailItem
          href="/settings"
          active={isSettings}
          icon={<IconGear />}
          label={t("settings")}
          onNavigate={onNavigate}
        />
      </div>
    </aside>
  );
}

/** Kept for MainAppShell API; rail is always compact. */
export function useSidebarCollapsed() {
  return [true, (_v: boolean) => {}] as const;
}
