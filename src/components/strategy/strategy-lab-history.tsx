"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { ReplayRow } from "@/hooks/query/use-strategies";

/** Fixed min width so columns stay readable; parent scrolls horizontally on narrow screens. */
const COL =
  "grid grid-cols-[minmax(7rem,1.4fr)_4.25rem_minmax(9rem,1.2fr)_3.75rem_4.75rem_4.25rem_3.5rem_5.25rem] items-center gap-x-3 px-3";

function formatDate(iso?: string | Date | null) {
  if (!iso) return "—";
  try {
    const d = typeof iso === "string" ? new Date(iso) : iso;
    if (Number.isNaN(d.getTime())) return "—";
    return d.toISOString().slice(0, 10);
  } catch {
    return "—";
  }
}

function formatRange(
  from?: string | Date | null,
  to?: string | Date | null,
): string {
  const a = formatDate(from);
  const b = formatDate(to);
  if (a === "—" && b === "—") return "—";
  return `${a} → ${b}`;
}

function fmtPct(n?: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  const s = `${n.toFixed(2)}%`;
  return n > 0 ? `+${s}` : s;
}

function statusTone(status: string): string {
  if (status === "done") {
    return "bg-[var(--brand-soft)] text-[var(--brand-text)]";
  }
  if (status === "failed") {
    return "bg-[color-mix(in_srgb,var(--down)_12%,transparent)] text-[var(--down)]";
  }
  return "bg-[var(--surface-2)] text-[var(--muted)]";
}

export function StrategyLabHistoryHeader() {
  const t = useTranslations("strategies");
  return (
    <div
      className={`${COL} shrink-0 border-b border-[var(--border)] bg-[var(--surface-2)] py-2 text-[11px] font-medium text-[var(--muted)]`}
      role="row"
    >
      <span>{t("historyColStrategy")}</span>
      <span>{t("symbol")}</span>
      <span>{t("historyColRange")}</span>
      <span>{t("status")}</span>
      <span className="text-right">{t("historyColReturn")}</span>
      <span className="text-right">{t("historyColMaxDd")}</span>
      <span className="text-right">{t("historyColTrades")}</span>
      <span className="text-right">{t("historyColDate")}</span>
    </div>
  );
}

export function StrategyLabHistoryRow({ row }: { row: ReplayRow }) {
  const t = useTranslations("strategies");
  const ret = row.result?.totalReturnPct;
  const dd = row.result?.maxDrawdownPct;
  const trades = row.result?.tradeCount;
  const statusKey =
    row.status === "done"
      ? "statusDone"
      : row.status === "failed"
        ? "statusFailed"
        : row.status === "running"
          ? "statusRunning"
          : row.status === "pending"
            ? "statusPending"
            : null;
  const statusLabel = statusKey ? t(statusKey) : row.status;

  return (
    <li className="border-b border-[var(--border)] last:border-0">
      <Link
        href={`/strategies/${row.strategyId}?replayId=${row.id}`}
        className={`${COL} py-2.5 transition hover:bg-[var(--surface-2)]/70`}
      >
        <span className="min-w-0 truncate text-[13px] font-medium text-[var(--foreground)]">
          {row.strategyName}
        </span>
        <span className="truncate font-medium tabular-nums text-[var(--foreground)]">
          {row.symbol}
        </span>
        <span className="truncate text-[11px] tabular-nums text-[var(--muted)]">
          {formatRange(row.rangeFrom, row.rangeTo)}
        </span>
        <span>
          <span
            className={`inline-flex h-5 max-w-full items-center truncate rounded px-1.5 text-[10px] font-medium ${statusTone(row.status)}`}
          >
            {statusLabel}
          </span>
        </span>
        <span
          className={`text-right text-[12px] font-medium tabular-nums ${
            typeof ret === "number"
              ? ret >= 0
                ? "text-[var(--up)]"
                : "text-[var(--down)]"
              : "text-[var(--muted)]"
          }`}
        >
          {fmtPct(ret)}
        </span>
        <span className="text-right text-[12px] tabular-nums text-[var(--muted)]">
          {typeof dd === "number" ? fmtPct(dd) : "—"}
        </span>
        <span className="text-right text-[12px] tabular-nums text-[var(--muted)]">
          {typeof trades === "number" ? trades : "—"}
        </span>
        <span className="text-right text-[11px] tabular-nums text-[var(--muted)]">
          {formatDate(row.createdAt)}
        </span>
      </Link>
    </li>
  );
}
