"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import {
  locales,
  languageLabels,
  localeCode,
  type AppLocale,
} from "@/i18n/config";
import { useMounted } from "@/hooks/use-mounted";

/**
 * 官网顶栏动作：主题 / 语言 / 登录。
 * 不拉提醒、设置弹窗、用户复杂菜单，避免营销页绑上 App 顶栏依赖。
 */
export function MarketingTopbarActions({
  showTheme = true,
  showLanguage = true,
}: {
  showTheme?: boolean;
  showLanguage?: boolean;
}) {
  const t = useTranslations("nav");
  const { data: session } = useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const mounted = useMounted();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const dark = mounted && (resolvedTheme || theme) === "dark";
  const loggedIn = mounted && Boolean(session?.user);

  useEffect(() => {
    if (!langOpen) return;
    function onDoc(e: MouseEvent) {
      if (!langRef.current?.contains(e.target as Node)) setLangOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [langOpen]);

  return (
    <div className="flex items-center gap-1 sm:gap-1.5" suppressHydrationWarning>
      {showTheme ? (
        <button
          type="button"
          className="qt-btn qt-btn-ghost h-7 w-7"
          aria-label="Toggle theme"
          suppressHydrationWarning
          onClick={() => setTheme(dark ? "light" : "dark")}
        >
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

      {showLanguage ? (
        <div className="relative" ref={langRef}>
          <button
            type="button"
            className="qt-btn qt-btn-ghost flex h-7 items-center gap-0.5 px-1 text-[11px] sm:gap-1 sm:px-1.5"
            aria-label={t("language")}
            aria-haspopup="listbox"
            aria-expanded={langOpen}
            onClick={() => setLangOpen((v) => !v)}
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
          {langOpen ? (
            <div
              role="listbox"
              className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1 shadow-[0_12px_40px_rgba(15,23,42,0.16)]"
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
                      if (!active) {
                        router.replace(pathname, { locale: l as AppLocale });
                      }
                    }}
                  >
                    <span
                      className={`inline-flex w-7 items-center justify-center rounded border px-0.5 py-0.5 text-[10px] font-bold ${
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
        </div>
      ) : null}

      {!mounted ? (
        <span className="inline-block h-8 w-[4.5rem] shrink-0" aria-hidden />
      ) : loggedIn ? (
        <Link
          href="/markets"
          className="qt-btn qt-btn-ghost inline-flex h-8 min-w-8 items-center justify-center px-2.5 text-[12px] font-bold"
          aria-label={
            session?.user?.name ||
            session?.user?.email?.split("@")[0] ||
            t("markets")
          }
        >
          {(
            session?.user?.name?.trim()?.[0] ||
            session?.user?.email?.[0] ||
            "U"
          ).toUpperCase()}
        </Link>
      ) : (
        <Link
          href="/login"
          className="qt-btn qt-btn-primary inline-flex h-8 items-center justify-center px-3.5 text-[13px] font-medium leading-none no-underline"
        >
          {t("login")}
        </Link>
      )}
    </div>
  );
}
