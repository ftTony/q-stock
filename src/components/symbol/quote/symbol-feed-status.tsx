"use client";

import { useTranslations } from "next-intl";

export type FeedStatusKind = "live" | "delayed" | "offline";

type Props = {
  kind: FeedStatusKind;
  className?: string;
};

/** Compact live / delayed / offline chip for the quote strip. */
export function SymbolFeedStatus({ kind, className }: Props) {
  const t = useTranslations("symbol");
  const label =
    kind === "live"
      ? t("feedLive")
      : kind === "delayed"
        ? t("feedDelayed")
        : t("feedOffline");
  const dot =
    kind === "live"
      ? "bg-[var(--up)]"
      : kind === "delayed"
        ? "bg-[var(--brand)]"
        : "bg-[var(--muted)]";

  return (
    <span
      className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2 text-[11px] tabular-nums text-[var(--muted)] ${className ?? ""}`}
      title={label}
      aria-label={label}
      role="status"
    >
      <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

export function feedStatusFromWs(opts: {
  enabled: boolean;
  connected: boolean;
  degraded: boolean;
  push: boolean;
}): FeedStatusKind {
  if (!opts.enabled) return "delayed";
  if (!opts.connected) return "offline";
  if (opts.degraded || !opts.push) return "delayed";
  return "live";
}
