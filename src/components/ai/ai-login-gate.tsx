"use client";

import { useTranslations } from "next-intl";
import { AiLoginButton } from "@/components/ai/ai-login-button";

function AiLoginArt() {
  return (
    <svg
      viewBox="0 0 160 120"
      className="h-28 w-auto text-[var(--brand)]"
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
  title?: string;
  body?: string;
  hint?: string;
}) {
  const t = useTranslations("ai");
  const fillClass = props.fill
    ? "qt-panel min-h-[calc(100dvh-11rem)] w-full lg:min-h-[calc(100dvh-7rem)]"
    : "min-h-[16rem]";

  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-10 text-center ${fillClass} ${props.className ?? ""}`}
    >
      <AiLoginArt />
      <h3 className="mt-4 text-base font-semibold tracking-tight">
        {props.title ?? t("loginTitle")}
      </h3>
      <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">
        {props.body ?? t("loginBody")}
      </p>
      <AiLoginButton className="qt-btn-primary mt-5 inline-flex h-10 items-center justify-center rounded-lg px-5 text-[14px] font-medium" />
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">
        {props.hint ?? t("loginHint")}
      </p>
    </div>
  );
}
