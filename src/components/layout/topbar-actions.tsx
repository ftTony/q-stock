"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { localeCode } from "@/i18n/config";
import { useMounted } from "@/hooks/use-mounted";
import { useAlerts } from "@/hooks/query/use-alerts";
import { getEquitySession } from "@/lib/market/session";
import { useSettingsModalOptional } from "@/components/settings/settings-modal-context";
import { useLoginModalOptional } from "@/components/auth/login-modal-context";
import { TopbarPortalMenu } from "@/components/layout/topbar-portal-menu";
import {
  AlertsMenuPanel,
  LanguageMenuPanel,
  UserMenuPanel,
  type TopbarAlertItem,
} from "@/components/layout/topbar-action-menus";

function useEquitySessionLabel(t: (key: string) => string) {
  const ready = useMounted();
  const [session, setSession] = useState(() => ({
    usOpen: false,
    hkOpen: false,
    cnOpen: false,
    anyOpen: false,
  }));

  useEffect(() => {
    const tick = () => setSession(getEquitySession());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  // Stable SSR + first paint label; avoid open/closed flip during hydration.
  if (!ready) {
    return { open: false, label: t("marketClosed") };
  }

  if (session.usOpen && session.hkOpen && session.cnOpen) {
    return { open: true, label: t("marketOpenMulti") };
  }
  if (session.usOpen && session.hkOpen) {
    return { open: true, label: t("marketOpenBoth") };
  }
  if (session.usOpen && session.cnOpen) {
    return { open: true, label: t("marketOpenUsCn") };
  }
  if (session.hkOpen && session.cnOpen) {
    return { open: true, label: t("marketOpenHkCn") };
  }
  if (session.usOpen) return { open: true, label: t("marketOpenUs") };
  if (session.hkOpen) return { open: true, label: t("marketOpenHk") };
  if (session.cnOpen) return { open: true, label: t("marketOpenCn") };
  return { open: false, label: t("marketClosed") };
}

function MarketStatus({ t }: { t: (key: string) => string }) {
  const market = useEquitySessionLabel(t);
  return (
    <span className="qt-chip max-w-full" title={market.label}>
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          market.open
            ? "bg-[var(--up)] shadow-[0_0_8px_var(--up)]"
            : "bg-[var(--muted)]"
        }`}
      />
      <span className="truncate">{market.label}</span>
    </span>
  );
}

const MENU_SHELL =
  "overflow-hidden rounded-none border border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] shadow-[0_8px_30px_rgba(15,23,42,0.12)]";

function ActionMenu({
  open,
  usePortal,
  anchorRef,
  menuRef,
  width,
  popClass,
  children,
}: {
  open: boolean;
  usePortal: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  menuRef: RefObject<HTMLDivElement | null>;
  width: number;
  popClass: string;
  children: ReactNode;
}) {
  if (!open) return null;
  if (usePortal) {
    return (
      <TopbarPortalMenu
        open={open}
        anchorRef={anchorRef}
        menuRef={menuRef}
        width={width}
        className={MENU_SHELL}
      >
        {children}
      </TopbarPortalMenu>
    );
  }
  return (
    <div ref={menuRef} className={`${popClass} ${MENU_SHELL}`} style={{ width }}>
      {children}
    </div>
  );
}

export function TopBarActions({
  showMarketStatus = true,
  showNotifications = true,
  showTheme = true,
  showLanguage = true,
  placement = "header",
  compact = false,
  /**
   * Marketing chrome: always `/login` page + larger CTA.
   * App shell: modal login (LoginModalBridge only mounts under MainAppShell).
   */
  loginMode = "modal",
}: {
  showMarketStatus?: boolean;
  showNotifications?: boolean;
  showTheme?: boolean;
  showLanguage?: boolean;
  placement?: "header" | "sidebar";
  compact?: boolean;
  loginMode?: "modal" | "page";
}) {
  const t = useTranslations("nav");
  const tAlerts = useTranslations("alerts");
  const { data: session } = useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const locale = useLocale();
  const mounted = useMounted();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const langPanelRef = useRef<HTMLDivElement>(null);
  const settingsModal = useSettingsModalOptional();
  const loginModal = useLoginModalOptional();

  const alertsQuery = useAlerts({
    enabled: Boolean(showNotifications && session?.user),
  });
  const alerts = (alertsQuery.data?.alerts ?? []) as TopbarAlertItem[];
  const alertCount = alerts.filter((a) => a.status === "active").length;
  const recent = [...alerts]
    .filter((a) => a.status === "triggered" || a.status === "active")
    .slice(0, 6);

  useEffect(() => {
    function outside(
      target: Node,
      trigger: HTMLElement | null,
      panel: HTMLElement | null,
    ) {
      return !trigger?.contains(target) && !panel?.contains(target);
    }
    function onDoc(e: MouseEvent) {
      const node = e.target as Node;
      if (outside(node, menuRef.current, menuPanelRef.current)) setMenuOpen(false);
      if (outside(node, notifRef.current, notifPanelRef.current)) setNotifOpen(false);
      if (outside(node, langRef.current, langPanelRef.current)) setLangOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const dark = mounted && (resolvedTheme || theme) === "dark";

  // Session chrome only after mount — SessionProvider often has null on SSR and
  // a user on the first client pass, which breaks hydration of this header tree.
  const loggedIn = mounted && Boolean(session?.user);
  const inSidebar = placement === "sidebar";
  const usePortal = !compact && !inSidebar;
  const pop = compact
    ? "absolute left-full top-0 z-50 ml-1.5"
    : inSidebar
      ? "absolute left-0 bottom-full z-50 mb-1.5"
      : "absolute right-0 z-50 mt-2";

  return (
    <div
      className={
        compact
          ? "flex flex-col items-center gap-1.5"
          : inSidebar
            ? "flex flex-wrap items-center gap-1.5"
            : "flex items-center gap-1 sm:gap-1.5"
      }
      suppressHydrationWarning
    >
      {loggedIn && showMarketStatus && (
        <MarketStatus t={(key) => t(key as "marketOpen")} />
      )}

      {showTheme ? (
        <button
          type="button"
          className="qt-btn qt-btn-ghost h-7 w-7"
          aria-label="Toggle theme"
          suppressHydrationWarning
          onClick={() => setTheme(dark ? "light" : "dark")}
        >
          {/* Fixed shell size so SSR/CSR never swap h-4 ↔ h-3.5 on the root child. */}
          <span
            className="inline-flex h-3.5 w-3.5 items-center justify-center"
            aria-hidden
            suppressHydrationWarning
          >
            {mounted ? (
              dark ? (
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              ) : (
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z" />
                </svg>
              )
            ) : null}
          </span>
        </button>
      ) : null}

      {loggedIn && showNotifications ? (
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            className="qt-btn qt-btn-ghost relative h-7 w-7"
            aria-label={t("alerts")}
            data-tour="nav-alerts"
            onClick={() => {
              setNotifOpen((v) => !v);
              setMenuOpen(false);
              setLangOpen(false);
            }}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
              <path d="M10 19a2 2 0 0 0 4 0" />
            </svg>
            {alertCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--down)] px-1 text-[10px] font-bold text-white">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            ) : null}
          </button>
          <ActionMenu
            open={notifOpen}
            usePortal={usePortal}
            anchorRef={notifRef}
            menuRef={notifPanelRef}
            width={288}
            popClass={pop}
          >
            <AlertsMenuPanel
              title={t("alerts")}
              manageLabel={tAlerts("title")}
              emptyLabel={tAlerts("empty")}
              statusLabel={(status) => tAlerts(status)}
              gteLabel={tAlerts("gte")}
              lteLabel={tAlerts("lte")}
              recent={recent}
              onClose={() => setNotifOpen(false)}
            />
          </ActionMenu>
        </div>
      ) : null}

      {showLanguage ? (
        <div className="relative" ref={langRef}>
          <button
            type="button"
            className="qt-btn qt-btn-ghost flex h-7 items-center gap-0.5 px-1 text-[11px] sm:gap-1 sm:px-1.5"
            aria-label="Language"
            aria-haspopup="listbox"
            onClick={() => {
              setLangOpen((v) => !v);
              setMenuOpen(false);
              setNotifOpen(false);
            }}
          >
            <span className="inline-flex h-4 min-w-[1.375rem] items-center justify-center rounded border border-[var(--border)] bg-[var(--sidebar-hover)] px-0.5 text-[9px] font-bold leading-none text-[var(--brand-text)]">
              {localeCode(locale)}
            </span>
            <svg
              className={`hidden h-2.5 w-2.5 text-[var(--muted)] transition-transform sm:block ${langOpen ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <ActionMenu
            open={langOpen}
            usePortal={usePortal}
            anchorRef={langRef}
            menuRef={langPanelRef}
            width={208}
            popClass={pop}
          >
            <LanguageMenuPanel locale={locale} onClose={() => setLangOpen(false)} />
          </ActionMenu>
        </div>
      ) : null}

      {!mounted ? (
        <span className="inline-block h-7 w-7 shrink-0" aria-hidden />
      ) : session?.user ? (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-7 w-7 text-[11px] font-bold"
            onClick={() => {
              setMenuOpen((v) => !v);
              setNotifOpen(false);
              setLangOpen(false);
            }}
            aria-label={
              session.user.name ||
              session.user.email?.split("@")[0] ||
              t("login")
            }
          >
            {(
              session.user.name?.trim()?.[0] ||
              session.user.email?.[0] ||
              "U"
            ).toUpperCase()}
          </button>
          <ActionMenu
            open={menuOpen}
            usePortal={usePortal}
            anchorRef={menuRef}
            menuRef={menuPanelRef}
            width={192}
            popClass={pop}
          >
            <UserMenuPanel
              name={
                session.user.name?.trim() ||
                session.user.email?.split("@")[0] ||
                "User"
              }
              email={session.user.email}
              settingsLabel={t("settings")}
              portfolioLabel={t("portfolio")}
              reviewLabel={t("review")}
              logoutLabel={t("logout")}
              onClose={() => setMenuOpen(false)}
              onOpenSettings={() => settingsModal?.openSettings()}
            />
          </ActionMenu>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          {loginMode === "page" || !loginModal ? (
            <Link
              href="/login"
              className={
                loginMode === "page"
                  ? "qt-btn qt-btn-primary inline-flex h-8 items-center justify-center px-3.5 text-[13px] font-medium leading-none no-underline"
                  : "qt-btn-primary inline-flex h-7 items-center justify-center px-2.5 text-[12px] font-medium leading-none no-underline"
              }
            >
              {t("login")}
            </Link>
          ) : (
            <button
              type="button"
              className="qt-btn-primary inline-flex h-7 items-center justify-center px-2.5 text-[12px] font-medium leading-none"
              onClick={loginModal.openLogin}
            >
              {t("login")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
