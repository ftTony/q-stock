"use client";

import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

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
  /**
   * While loading, show spinner + elapsed seconds instead of loadingLabel.
   * Pass a formatter, e.g. (s) => t("elapsed", { seconds: s }).
   */
  showElapsed?: boolean | ((seconds: number) => ReactNode);
};

function useElapsedSeconds(active: boolean) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!active) {
      setSeconds(0);
      return;
    }
    setSeconds(0);
    const started = Date.now();
    const id = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - started) / 1000));
    }, 250);
    return () => window.clearInterval(id);
  }, [active]);

  return seconds;
}

/** Submit / action button with spinner + disabled while loading. */
export function SubmitButton({
  loading = false,
  loadingLabel,
  showElapsed = false,
  children,
  className = "",
  disabled,
  type = "submit",
  ...rest
}: Props) {
  const isDisabled = Boolean(disabled || loading);
  const seconds = useElapsedSeconds(Boolean(loading && showElapsed));

  let label: ReactNode = children;
  if (loading) {
    if (showElapsed) {
      label =
        typeof showElapsed === "function"
          ? showElapsed(seconds)
          : `${seconds}s`;
    } else {
      label = loadingLabel ?? children;
    }
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`qt-btn inline-flex items-center justify-center gap-2 ${className} text-[14px]`}
      {...rest}
    >
      {loading && <Spinner />}
      <span>{label}</span>
    </button>
  );
}

export { Spinner };
