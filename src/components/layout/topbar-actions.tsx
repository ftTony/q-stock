"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import {
  locales,
  languageLabels,
  localeCode,
  type AppLocale,
} from "@/i18n/config";

type AlertItem = {
  id: string;
  symbol: string;
  assetType: string;
  condition: "gte" | "lte";
  triggerPrice: number;
  status: "active" | "triggered" | "disabled";
  triggeredAt?: string | null;
};

export function TopBarActions() {
  const t = useTranslations("nav");
  const tAlerts = useTranslations("alerts");
  const { data: session } = useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [alertCount, setAlertCount] = useState(0);
  const [recent, setRecent] = useState<AlertItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session?.user) {
      setAlertCount(0);
      setRecent([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/alerts");
      if (!res.ok || cancelled) return;
      const data = await res.json();
      const alerts = (data.alerts ?? []) as AlertItem[];
      setAlertCount(alerts.filter((a) => a.status === "active").length);
      setRecent(
        [...alerts]
          .filter((a) => a.status === "triggered" || a.status === "active")
          .slice(0, 6),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [session, pathname]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
      if (!notifRef.current?.contains(e.target as Node)) setNotifOpen(false);
      if (!langRef.current?.contains(e.target as Node)) setLangOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const dark = (resolvedTheme || theme) === "dark";

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="qt-chip hidden sm:inline-flex">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--up)] shadow-[0_0_8px_var(--up)]" />
        {t("marketOpen")}
      </span>

      <button
        type="button"
        className="qt-btn qt-btn-ghost h-9 w-9"
        aria-label="Toggle theme"
        onClick={() => setTheme(dark ? "light" : "dark")}
      >
        {dark ? (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z" />
          </svg>
        )}
      </button>

      <div className="relative" ref={notifRef}>
        <button
          type="button"
          className="qt-btn qt-btn-ghost relative h-9 w-9"
          aria-label={t("alerts")}
          onClick={() => {
            if (!session?.user) {
              router.push("/login");
              return;
            }
            setNotifOpen((v) => !v);
            setMenuOpen(false);
          }}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
            <path d="M10 19a2 2 0 0 0 4 0" />
          </svg>
          {alertCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--down)] px-1 text-[10px] font-bold text-white">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </button>
        {notifOpen && (
          <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
              <span className="text-sm font-semibold">{t("alerts")}</span>
              <Link
                href="/alerts"
                className="text-xs text-[var(--brand-text)]"
                onClick={() => setNotifOpen(false)}
              >
                {tAlerts("title")}
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-[var(--muted)]">
                {tAlerts("empty")}
              </div>
            ) : (
              <ul className="max-h-72 overflow-auto">
                {recent.map((a) => (
                  <li key={a.id} className="border-b border-[var(--border)] last:border-0">
                    <Link
                      href={`/alerts?symbol=${a.symbol}&assetType=${a.assetType}`}
                      className="block px-3 py-2.5 hover:bg-[var(--sidebar-hover)]"
                      onClick={() => setNotifOpen(false)}
                    >
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="font-semibold">{a.symbol}</span>
                        <span
                          className={`text-[10px] uppercase ${
                            a.status === "triggered"
                              ? "text-[var(--down)]"
                              : "text-[var(--up)]"
                          }`}
                        >
                          {tAlerts(a.status)}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-[var(--muted)]">
                        {a.condition === "gte" ? tAlerts("gte") : tAlerts("lte")}{" "}
                        {a.triggerPrice}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="relative hidden md:block" ref={langRef}>
        <button
          type="button"
          className="qt-btn qt-btn-ghost flex h-9 items-center gap-1.5 px-2 text-xs"
          aria-label="Language"
          aria-haspopup="listbox"
          aria-expanded={langOpen}
          onClick={() => {
            setLangOpen((v) => !v);
            setMenuOpen(false);
            setNotifOpen(false);
          }}
        >
          <span className="inline-flex h-5 w-7 items-center justify-center rounded border border-[var(--border)] bg-[var(--sidebar-hover)] text-[10px] font-bold text-[var(--brand-text)]">
            {localeCode(locale)}
          </span>
          <svg
            className={`h-3 w-3 text-[var(--muted)] transition-transform ${langOpen ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {langOpen && (
          <div
            role="listbox"
            className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1 shadow-[0_8px_30px_rgba(15,23,42,0.12)]"
          >
            {locales.map((l) => {
              const active = l === locale;
              return (
                <button
                  key={l}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-[var(--sidebar-hover)] ${
                    active
                      ? "bg-[var(--brand-soft)] font-semibold text-[var(--brand-text)]"
                      : "text-[var(--foreground)]"
                  }`}
                  onClick={() => {
                    setLangOpen(false);
                    if (!active) router.replace(pathname, { locale: l as AppLocale });
                  }}
                >
                  <span
                    className={`inline-flex w-7 items-center justify-center rounded border px-0.5 py-0.5 text-[10px] font-bold ${
                      active
                        ? "border-[var(--brand-text)] text-[var(--brand-text)]"
                        : "border-[var(--border)] bg-[var(--sidebar-hover)] text-[var(--muted)]"
                    }`}
                  >
                    {localeCode(l)}
                  </span>
                  <span className="truncate">{languageLabels[l]}</span>
                  {active && (
                    <svg
                      className="ml-auto h-3.5 w-3.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {session?.user ? (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="qt-btn qt-btn-ghost h-9 w-9 rounded-full text-xs font-bold"
            onClick={() => {
              setMenuOpen((v) => !v);
              setNotifOpen(false);
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
          {menuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-xl">
              <div className="border-b border-[var(--border)] px-3 py-2.5">
                <div className="truncate text-sm font-medium text-[var(--foreground)]">
                  {session.user.name?.trim() ||
                    session.user.email?.split("@")[0] ||
                    "User"}
                </div>
                {session.user.email && (
                  <div className="mt-0.5 truncate text-[11px] text-[var(--muted)]">
                    {session.user.email}
                  </div>
                )}
              </div>
              <Link
                href="/settings"
                className="block px-3 py-2 text-sm hover:bg-[var(--sidebar-hover)]"
                onClick={() => setMenuOpen(false)}
              >
                {t("settings")}
              </Link>
              <Link
                href="/portfolio"
                className="block px-3 py-2 text-sm hover:bg-[var(--sidebar-hover)]"
                onClick={() => setMenuOpen(false)}
              >
                {t("portfolio")}
              </Link>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm text-[var(--down)] hover:bg-[var(--sidebar-hover)]"
                onClick={() => signOut({ callbackUrl: `/${locale}` })}
              >
                {t("logout")}
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login" className="qt-btn qt-btn-primary h-9 px-3 text-xs">
          {t("login")}
        </Link>
      )}
    </div>
  );
}
