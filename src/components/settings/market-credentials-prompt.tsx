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
 * Slim scrolling notice when broker OpenAPI keys are missing.
 * Text marquees; CTA buttons stay pinned on the right.
 * Hidden on settings / auth / about. `fluid` = full-bleed pages.
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

  const title = t("credsPromptTitle");
  const body = t("credsPromptBody");

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
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href={settingsHref}
            className="qt-btn qt-btn-primary inline-flex h-6 items-center justify-center !rounded-full !px-2.5 !py-0 !text-[12px] !font-medium !leading-none !text-[var(--on-brand)] no-underline transition active:scale-95"
          >
            {t("credsPromptAction")}
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex h-6 items-center justify-center rounded-full px-1.5 !text-[12px] !font-medium !leading-none text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            {t("credsPromptLater")}
          </button>
        </div>
      </div>
    </div>
  );
}
