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
import { useSettingsModalOptional } from "@/components/settings/settings-modal-context";

/**
 * Broker OpenAPI key notice.
 * - `inline` (default in app shell): sits in the topbar middle as a marquee.
 * - block: legacy full-width strip (unused by main shell).
 */
export function MarketCredentialsPrompt({
  fluid = false,
  inline = false,
}: {
  fluid?: boolean;
  inline?: boolean;
}) {
  const t = useTranslations("settings");
  const { status: sessionStatus } = useSession();
  const pathname = usePathname();
  const settingsModal = useSettingsModalOptional();
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

  const title = t("credsPromptTitle");
  const body = t("credsPromptBody");
  const authed = sessionStatus === "authenticated";

  const marquee = (
    <div className="qt-marquee min-w-0 flex-1">
      <div className="qt-marquee-track">
        {[0, 1].map((i) => (
          <span
            key={i}
            aria-hidden={i === 1 ? true : undefined}
            className="inline-flex items-baseline gap-1.5 whitespace-nowrap pr-10 text-[12px] leading-none tracking-[-0.12px]"
          >
            <span className="font-semibold text-[var(--foreground)]">
              {title}
            </span>
            <span className="text-[var(--muted)]">{body}</span>
          </span>
        ))}
      </div>
    </div>
  );

  const actionClass =
    "qt-btn-primary inline-flex h-7 items-center justify-center px-2.5 text-[12px] font-medium leading-none no-underline shadow-none";
  const laterClass =
    "inline-flex h-7 items-center justify-center rounded-none px-2.5 text-[12px] font-medium leading-none tracking-[-0.12px] text-[var(--foreground)]/70 hover:bg-black/[0.04] hover:text-[var(--foreground)]";
  const setupHref = authed
    ? "/settings?setupKeys=1"
    : "/login?next=/settings%3FsetupKeys%3D1";
  const actionLabel = t("credsPromptAction");

  const primaryAction = (compact: boolean) =>
    authed && settingsModal ? (
      <button
        type="button"
        className={
          compact
            ? `${actionClass} max-w-[4.75rem] truncate px-2`
            : actionClass
        }
        title={actionLabel}
        onClick={() => settingsModal.openSettings({ setupKeys: true })}
      >
        {actionLabel}
      </button>
    ) : (
      <Link
        href={setupHref}
        className={
          compact
            ? `${actionClass} max-w-[4.75rem] truncate px-2`
            : actionClass
        }
        title={actionLabel}
      >
        {actionLabel}
      </Link>
    );

  const actions = (
    <div className="flex shrink-0 items-center gap-1.5">
      {primaryAction(false)}
      <button type="button" onClick={dismiss} className={laterClass}>
        {t("credsPromptLater")}
      </button>
    </div>
  );

  if (inline) {
    return (
      <div
        role="status"
        aria-label={`${title}. ${body}`}
        className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden border-l border-[var(--aw-hairline,var(--border))] pl-2 sm:gap-2.5 sm:pl-3"
      >
        {/* Narrow: short CTA only — full marquee + actions overlap theme/lang/login. */}
        <div className="hidden min-w-0 flex-1 md:block">{marquee}</div>
        <div className="shrink-0 md:hidden">{primaryAction(true)}</div>
        <div className="hidden shrink-0 items-center gap-1.5 md:flex">
          {primaryAction(false)}
          <button
            type="button"
            onClick={dismiss}
            className={`${laterClass} hidden lg:inline-flex`}
          >
            {t("credsPromptLater")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={`${title}. ${body}`}
      className="border-b border-[var(--border)] bg-[var(--brand-soft)]"
    >
      <div
        className={
          fluid
            ? "flex h-8 w-full items-center gap-2 px-3 sm:gap-3 sm:px-4"
            : "mx-auto flex h-8 w-full max-w-6xl items-center gap-2 px-3 sm:gap-3 sm:px-4"
        }
      >
        {marquee}
        {actions}
      </div>
    </div>
  );
}
