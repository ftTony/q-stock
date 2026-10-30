"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useLoginModalOptional } from "@/components/auth/login-modal-context";
import {
  AUTH_LOGIN_CTA_COMPACT,
  AUTH_LOGIN_CTA_DEFAULT,
} from "@/components/auth/auth-login-cta";

export { AUTH_LOGIN_CTA_COMPACT, AUTH_LOGIN_CTA_DEFAULT };

function AuthLoginArt({ compact }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={
        compact
          ? "h-16 w-auto text-[var(--brand)]"
          : "h-28 w-auto text-[var(--brand)]"
      }
      aria-hidden
    >
      <ellipse cx="80" cy="108" rx="44" ry="7" fill="currentColor" opacity="0.1" />
      <rect
        x="38"
        y="28"
        width="84"
        height="68"
        rx="12"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <circle
        cx="80"
        cy="52"
        r="14"
        fill="color-mix(in srgb, var(--brand) 14%, var(--panel))"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="80" cy="48" r="5" fill="currentColor" opacity="0.55" />
      <path
        d="M68 62c2.5-4 7-6.5 12-6.5s9.5 2.5 12 6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect
        x="52"
        y="78"
        width="56"
        height="8"
        rx="4"
        fill="currentColor"
        opacity="0.16"
      />
    </svg>
  );
}

/** Centered sign-in prompt for account-only surfaces. */
export function AuthLoginGate(props: {
  className?: string;
  title?: string;
  body?: string;
  hint?: string;
  /** Narrow column (e.g. symbol watchlist) — tighter art + full-width CTA. */
  compact?: boolean;
}) {
  const tNav = useTranslations("nav");
  const tWatch = useTranslations("watchlist");
  const loginModal = useLoginModalOptional();
  const title = props.title ?? tWatch("loginTitle");
  const body = props.body ?? tWatch("loginBody");
  const hint = props.hint ?? tWatch("loginHint");
  const compact = Boolean(props.compact);
  const ctaClass = compact ? AUTH_LOGIN_CTA_COMPACT : AUTH_LOGIN_CTA_DEFAULT;

  return (
    <div
      className={
        compact
          ? `flex w-full flex-col items-center px-1 text-center ${props.className ?? ""}`
          : `qt-panel flex min-h-[calc(100dvh-11rem)] w-full flex-col items-center justify-center px-6 py-10 text-center lg:min-h-[calc(100dvh-7rem)] ${props.className ?? ""}`
      }
    >
      <AuthLoginArt compact={compact} />
      <h3
        className={
          compact
            ? "mt-3 text-[13px] font-semibold tracking-tight text-[var(--foreground)]"
            : "mt-4 text-base font-semibold tracking-tight"
        }
      >
        {title}
      </h3>
      <p
        className={
          compact
            ? "mt-1.5 max-w-[16rem] text-[12px] leading-relaxed text-[var(--muted)]"
            : "mt-2 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]"
        }
      >
        {body}
      </p>
      {loginModal ? (
        <button type="button" className={ctaClass} onClick={loginModal.openLogin}>
          {tNav("login")}
        </button>
      ) : (
        <Link href="/login" className={ctaClass}>
          {tNav("login")}
        </Link>
      )}
      {hint ? (
        <p
          className={
            compact
              ? "mt-2.5 max-w-[16rem] text-[11px] leading-relaxed text-[var(--muted)]"
              : "mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]"
          }
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
