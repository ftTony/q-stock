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
 * Top banner for logged-in users who have not saved Longbridge/Futu keys.
 * Hidden on settings (they can fill the form there) and auth pages.
 */
export function MarketCredentialsPrompt() {
  const t = useTranslations("settings");
  const { status: sessionStatus } = useSession();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      setShow(false);
      return;
    }
    if (
      pathname.startsWith("/settings") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register")
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
      const status = await fetchMarketCredsStatus();
      if (cancelled) return;
      setShow(!hasAnyBrokerCreds(status));
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

  return (
    <div
      role="status"
      className="border-b border-[var(--border)] bg-[var(--brand-soft)] px-4 py-2.5 sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-[var(--foreground)]">
          <span className="font-medium">{t("credsPromptTitle")}</span>
          <span className="ml-1.5 text-[var(--muted)]">
            {t("credsPromptBody")}
          </span>
        </p>
        <div className="flex items-center gap-2">
          <Link
            href="/settings?setupKeys=1"
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
