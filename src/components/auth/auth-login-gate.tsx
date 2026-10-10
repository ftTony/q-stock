"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

function AuthLoginArt() {
  return (
    <svg
      viewBox="0 0 160 120"
      className="h-28 w-auto text-[var(--brand)]"
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

/** Centered sign-in prompt for account-only pages (watchlist / alerts / portfolio). */
export function AuthLoginGate(props: {
  className?: string;
  title: string;
  body: string;
  hint?: string;
}) {
  const tNav = useTranslations("nav");

  return (
    <div
      className={`qt-panel flex min-h-[calc(100dvh-11rem)] w-full flex-col items-center justify-center px-6 py-10 text-center lg:min-h-[calc(100dvh-7rem)] ${props.className ?? ""}`}
    >
      <AuthLoginArt />
      <h3 className="mt-4 text-base font-semibold tracking-tight">
        {props.title}
      </h3>
      <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">
        {props.body}
      </p>
      <Link
        href="/login"
        className="qt-btn-primary mt-5 inline-flex h-10 items-center justify-center rounded-lg px-5 text-[14px] font-medium"
      >
        {tNav("login")}
      </Link>
      {props.hint ? (
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">
          {props.hint}
        </p>
      ) : null}
    </div>
  );
}
