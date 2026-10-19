"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import {
  locales,
  languageLabels,
  localeCode,
  type AppLocale,
} from "@/i18n/config";
import { TopBarActions } from "@/components/layout/topbar-actions";
import { SiteLogo } from "@/components/brand/site-logo";
import { MARKETING_SHELL_WIDTH } from "@/components/marketing/marketing-width";
import { useMounted } from "@/hooks/use-mounted";

const MARKETING_LINKS = [
  { href: "/" as const, labelKey: "home" as const },
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
  const router = useRouter();
  const locale = useLocale();
  const mounted = useMounted();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  /** Stay mounted briefly so close can animate out. */
  const [menuPainted, setMenuPainted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const isLandingHome = pathname === "/";
  /** Full-viewport chrome for short pages only (pricing scrolls — too tall for one screen). */
  const isOneScreen = pathname.startsWith("/disclaimer");
  const dark = mounted && (resolvedTheme || theme) === "dark";

  function linkActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  useEffect(() => {
    setMenuOpen(false);
    setLangOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      setMenuPainted(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setMenuVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setMenuVisible(false);
    const t = window.setTimeout(() => setMenuPainted(false), 280);
    return () => window.clearTimeout(t);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

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
          <Link
            href="/"
            className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3"
            onClick={() => setMenuOpen(false)}
          >
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
            className="ml-auto hidden min-w-0 items-center justify-end gap-1 md:flex lg:gap-2"
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

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 md:ml-0">
            <TopBarActions
              showMarketStatus={false}
              showNotifications={false}
              showTheme={!menuOpen}
              showLanguage={!menuOpen}
            />
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--foreground)] transition hover:bg-[var(--sidebar-hover)] active:scale-95 md:hidden motion-reduce:active:scale-100"
              aria-label={menuOpen ? tNav("closeMenu") : tNav("openMenu")}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="relative block h-[14px] w-[18px]" aria-hidden>
                <span
                  className={`absolute left-0 block h-[1.5px] w-full rounded-full bg-current transition-[top,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    menuOpen ? "top-[6.25px] rotate-45" : "top-0 rotate-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-[6.25px] block h-[1.5px] w-full rounded-full bg-current transition-opacity duration-200 ease-out motion-reduce:transition-none ${
                    menuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-[1.5px] w-full rounded-full bg-current transition-[top,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    menuOpen
                      ? "top-[6.25px] -rotate-45"
                      : "top-[12.5px] rotate-0"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {menuPainted ? (
        <div
          className={`mkt-nav-drawer fixed inset-x-0 bottom-0 top-14 z-30 flex flex-col bg-[var(--panel)] md:hidden ${
            menuVisible ? "is-open" : ""
          }`}
        >
          <nav aria-label={tNav("main")} className="flex-1 overflow-y-auto">
            {MARKETING_LINKS.map((item) => {
              const active = linkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`mkt-nav-item block border-b border-[var(--border)] px-5 py-4 text-[16px] ${
                    active
                      ? "font-semibold text-[var(--brand-text)]"
                      : "font-medium text-[var(--foreground)]"
                  }`}
                >
                  {tNav(item.labelKey)}
                </Link>
              );
            })}
          </nav>
          <div className="mkt-nav-foot relative space-y-3 border-t border-[var(--border)] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {langOpen ? (
              <div
                role="listbox"
                aria-label={tNav("language")}
                className="absolute inset-x-5 bottom-full z-10 mb-2 max-h-64 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1.5 shadow-[0_12px_40px_rgba(15,23,42,0.16)] qt-scroll"
              >
                {locales.map((l) => {
                  const active = l === locale;
                  return (
                    <button
                      key={l}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[14px] ${
                        active
                          ? "bg-[var(--brand-soft)] font-semibold text-[var(--brand-text)]"
                          : "text-[var(--foreground)]"
                      }`}
                      onClick={() => {
                        setLangOpen(false);
                        if (!active) {
                          router.replace(pathname, { locale: l as AppLocale });
                        }
                      }}
                    >
                      <span
                        className={`inline-flex w-8 shrink-0 items-center justify-center rounded border px-0.5 py-0.5 text-[10px] font-bold ${
                          active
                            ? "border-[var(--brand-text)] text-[var(--brand-text)]"
                            : "border-[var(--border)] text-[var(--muted)]"
                        }`}
                      >
                        {localeCode(l)}
                      </span>
                      <span className="truncate">{languageLabels[l]}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
            <button
              type="button"
              className="flex w-full items-center gap-2 text-left text-[14px] font-medium text-[var(--brand-text)]"
              aria-label={tNav("language")}
              aria-expanded={langOpen}
              onClick={() => setLangOpen((v) => !v)}
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9s1.3-6.2 3.8-9z" />
              </svg>
              <span className="min-w-0 flex-1 truncate">
                {languageLabels[locale as AppLocale]}
              </span>
              <svg
                className={`h-3.5 w-3.5 shrink-0 transition-transform ${langOpen ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface-2)] px-3 py-2">
              <span className="text-[14px] text-[var(--foreground)]">
                {tNav("appearance")}
              </span>
              <div
                className="flex shrink-0 rounded-full bg-[var(--panel)] p-0.5"
                role="group"
                aria-label={tNav("appearance")}
              >
                <button
                  type="button"
                  aria-pressed={!dark}
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    !dark
                      ? "bg-[var(--surface-2)] text-[var(--foreground)]"
                      : "text-[var(--muted)]"
                  }`}
                  onClick={() => setTheme("light")}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-pressed={dark}
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    dark
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "text-[var(--muted)]"
                  }`}
                  onClick={() => setTheme("dark")}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

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
