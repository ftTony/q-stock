"use client";

import { useTranslations } from "next-intl";
import { AiLoginButton } from "@/components/ai/ai-login-button";
import { AccountPageFill } from "@/components/auth/account-page-fill";
import {
  AUTH_LOGIN_CTA_COMPACT,
  AUTH_LOGIN_CTA_DEFAULT,
} from "@/components/auth/auth-login-cta";

function AiLoginArt({ compact }: { compact?: boolean }) {
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
      <ellipse cx="80" cy="108" rx="46" ry="8" fill="currentColor" opacity="0.1" />
      <rect
        x="22"
        y="38"
        width="72"
        height="52"
        rx="10"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <path
        d="M34 74 L50 58 L62 66 L82 46"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="82" cy="46" r="3" fill="currentColor" />
      <rect x="34" y="48" width="10" height="26" rx="2" fill="currentColor" opacity="0.18" />
      <rect x="48" y="54" width="10" height="20" rx="2" fill="currentColor" opacity="0.28" />
      <rect x="62" y="44" width="10" height="30" rx="2" fill="currentColor" opacity="0.4" />
      <g transform="translate(96 22)">
        <rect
          width="46"
          height="54"
          rx="16"
          fill="color-mix(in srgb, var(--brand) 14%, var(--panel))"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle cx="16" cy="24" r="3.2" fill="currentColor" />
        <circle cx="30" cy="24" r="3.2" fill="currentColor" />
        <path
          d="M16 34h14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path d="M23 8v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="23" cy="6.5" r="2.2" fill="currentColor" />
      </g>
    </svg>
  );
}

export function AiLoginGate(props: {
  className?: string;
  /** Fill remaining viewport under the top bar (account pages). */
  fill?: boolean;
  /** Dock / narrow column — match comments AuthLoginGate compact. */
  compact?: boolean;
  title?: string;
  body?: string;
  hint?: string;
}) {
  const t = useTranslations("ai");
  const tNav = useTranslations("nav");
  /** Dock / AI drawer default compact — same density as comments AuthLoginGate. */
  const compact = Boolean(props.compact ?? !props.fill);
  const fill = Boolean(props.fill) && !compact;

  const inner = (
    <>
      <AiLoginArt compact={compact} />
      <h3
        className={
          compact
            ? "mt-3 text-[13px] font-semibold tracking-tight text-[var(--foreground)]"
            : "mt-4 text-base font-semibold tracking-tight"
        }
      >
        {props.title ?? t("loginTitle")}
      </h3>
      <p
        className={
          compact
            ? "mt-1.5 max-w-[16rem] text-[12px] leading-relaxed text-[var(--muted)]"
            : "mt-2 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]"
        }
      >
        {props.body ?? t("loginBody")}
      </p>
      <AiLoginButton
        className={compact ? AUTH_LOGIN_CTA_COMPACT : AUTH_LOGIN_CTA_DEFAULT}
      >
        {tNav("login")}
      </AiLoginButton>
      {props.hint !== "" ? (
        <p
          className={
            compact
              ? "mt-2.5 max-w-[16rem] text-[11px] leading-relaxed text-[var(--muted)]"
              : "mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]"
          }
        >
          {props.hint ?? t("loginHint")}
        </p>
      ) : null}
    </>
  );

  if (fill) {
    return (
      <AccountPageFill
        className={`items-center justify-center px-4 py-8 text-center ${props.className ?? ""}`}
      >
        {inner}
      </AccountPageFill>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center px-4 py-8 text-center ${
        compact ? "min-h-0" : "qt-panel min-h-[16rem]"
      } ${props.className ?? ""}`}
    >
      {inner}
    </div>
  );
}
