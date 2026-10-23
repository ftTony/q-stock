"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { localizedPath } from "@/i18n/config";
import { SiteLogo } from "@/components/brand/site-logo";
import { IconSettingsGear } from "@/components/symbol/watchlist-toggle-icons";
import { useSettingsModalOptional } from "@/components/settings/settings-modal-context";

/** Icon-rail width (product chrome — always compact). */
export const SIDEBAR_WIDTH_EXPANDED = 56;
export const SIDEBAR_WIDTH_COLLAPSED = 56;

function IconHome({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
    </svg>
  );
}

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

function RailItem({
  href,
  active,
  icon,
  label,
  onNavigate,
  hard,
  onClick,
}: {
  href?: string;
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onNavigate?: () => void;
  /** Full page navigation (marketing/home). */
  hard?: boolean;
  /** Prefer over href when set (e.g. settings modal). */
  onClick?: () => void;
}) {
  const className = `flex h-10 w-10 items-center justify-center rounded-lg transition ${
    active
      ? "bg-[var(--sidebar-active)] text-[var(--brand-text)]"
      : "text-[color-mix(in_srgb,var(--muted)_88%,transparent)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
  }`;

  if (onClick) {
    return (
      <button
        type="button"
        title={label}
        aria-label={label}
        className={className}
        onClick={() => {
          onClick();
          onNavigate?.();
        }}
      >
        {icon}
      </button>
    );
  }

  if (hard && href) {
    return (
      <a href={href} title={label} aria-label={label} className={className}>
        {icon}
      </a>
    );
  }

  return (
    <Link
      href={href ?? "/"}
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

  const isHome = pathname === "/";
  const isMarkets = pathname === "/markets" || pathname.startsWith("/markets/");
  const isAnalysis = pathname.startsWith("/analysis") || pathname.startsWith("/symbol");
  const isPortfolio = pathname.startsWith("/portfolio");
  const isReview = pathname.startsWith("/review");
  const isStrategies = pathname.startsWith("/strategies");
  const isAlerts = pathname.startsWith("/alerts");
  const settingsModal = useSettingsModalOptional();

  return (
    <aside className="flex h-full w-full flex-col border-r border-[var(--border)] bg-[var(--sidebar)]">
      {/* Match main topbar h-10 so the hairline aligns across the shell. */}
      <div className="flex h-10 shrink-0 items-center justify-center border-b border-[var(--border)]">
        <a href={homeHref} className="relative z-10" aria-label={t("markets")}>
          <SiteLogo height={22} priority variant="mark" />
        </a>
      </div>

      <nav className="qt-scroll flex flex-1 flex-col items-center gap-1.5 overflow-y-auto px-1.5 py-3">
        <RailItem
          href={homeHref}
          active={isHome}
          icon={<IconHome />}
          label={t("home")}
          onNavigate={onNavigate}
          hard
        />
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

      <div className="flex shrink-0 items-center justify-center border-t border-[var(--border)] px-1.5 py-1">
        <RailItem
          active={settingsModal?.open}
          icon={<IconSettingsGear className="h-3.5 w-3.5" />}
          label={t("settings")}
          onNavigate={onNavigate}
          onClick={() => settingsModal?.openSettings()}
        />
      </div>
    </aside>
  );
}

/** Kept for MainAppShell API; rail is always compact. */
export function useSidebarCollapsed() {
  return [true, (_v: boolean) => {}] as const;
}
