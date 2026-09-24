"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

function Spinner({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: ReactNode;
};

/** Submit / action button with spinner + disabled while loading. */
export function SubmitButton({
  loading = false,
  loadingLabel,
  children,
  className = "",
  disabled,
  type = "submit",
  ...rest
}: Props) {
  const isDisabled = Boolean(disabled || loading);
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`qt-btn inline-flex items-center justify-center gap-2 ${className}`}
      {...rest}
    >
      {loading && <Spinner />}
      <span>{loading ? (loadingLabel ?? children) : children}</span>
    </button>
  );
}
