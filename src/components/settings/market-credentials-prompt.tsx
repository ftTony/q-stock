"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import {
  CREDS_DISMISS_KEY,
  fetchMarketCredsStatus,
  hasAnyBrokerCreds,
} from "@/lib/market/creds-status-client";

/**
 * Single markets/data-source notice (marquee + actions).
 * Shown when broker keys are missing; hidden on settings / auth / about.
 * `fluid` matches full-bleed pages (markets / analysis / symbol).
 */
export function MarketCredentialsPrompt({ fluid = false }: { fluid?: boolean }) {
  const t = useTranslations("settings");
  const { status: sessionStatus } = useSession();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (
      pathname.startsWith("/settings") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password") ||
      pathname.startsWith("/auth/") ||
      pathname.startsWith("/about")
    ) {
      setShow(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        if (sessionStorage.getItem(CREDS_DISMISS_KEY) === "1") {
          if (!cancelled) setShow(false);
          return;
        }
      } catch {
        /* ignore */
      }

      if (sessionStatus !== "authenticated") {
        if (!cancelled) setShow(true);
        return;
      }

      const status = await fetchMarketCredsStatus();
      if (!cancelled) setShow(!hasAnyBrokerCreds(status));
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionStatus, pathname]);

  if (!show) return null;

  function dismiss() {
    try {
      sessionStorage.setItem(CREDS_DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  const settingsHref =
    sessionStatus === "authenticated"
      ? "/settings?setupKeys=1"
      : "/login?next=/settings%3FsetupKeys%3D1";

  const segment = (
    <span className="inline-flex items-center gap-3 px-4 text-[12px] sm:px-6 sm:text-[13px]">
      <span className="font-medium text-[var(--foreground)]">
        {t("credsPromptTitle")}
      </span>
      <span className="text-[var(--muted)]">{t("credsPromptBody")}</span>
      <span aria-hidden className="text-[var(--border)]">
        {" | "}
      </span>
    </span>
  );

  return (
    <div
      role="status"
      className="border-b border-[var(--border)] bg-[var(--brand-soft)] py-2"
    >
      <div
        className={
          fluid
            ? "flex w-full items-center gap-2 px-2 sm:px-4"
            : "mx-auto flex w-full max-w-6xl items-center gap-2 px-2 sm:px-4"
        }
      >
        <div className="qt-marquee min-w-0 flex-1">
          <div className="qt-marquee-track">
            {segment}
            {segment}
            {segment}
            {segment}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pr-1 sm:gap-2">
          <Link
            href={settingsHref}
            className="qt-btn qt-btn-primary h-8 px-3 text-xs"
          >
            {t("credsPromptAction")}
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg px-2 py-1 text-xs text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
          >
            {t("credsPromptLater")}
          </button>
        </div>
      </div>
    </div>
  );
}
