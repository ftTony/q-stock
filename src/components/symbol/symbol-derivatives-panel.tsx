"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  useMarketOptionsChain,
  useMarketOptionsMeta,
} from "@/hooks/query/use-market-options";
import { formatNumber } from "@/lib/format-number";
import type { OptionRow } from "@/lib/market/providers/longbridge-research";
import type { AssetType } from "@/lib/types";

const COLS = ["contract", "last", "chg", "iv", "oi", "vol"] as const;

function OptionTable({
  title,
  rows,
  empty,
  flush = false,
}: {
  title: string;
  rows: OptionRow[];
  empty: string;
  /** When true, drop outer border — parent provides shared frame. */
  flush?: boolean;
}) {
  const t = useTranslations("symbol");
  return (
    <div
      className={`min-h-0 min-w-0 flex-1 overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        flush ? "" : "border border-[var(--aw-hairline,var(--border))]"
      }`}
    >
      <div className="border-b border-[var(--aw-hairline,var(--border))] px-3 py-2 text-[12px] font-semibold tracking-[-0.08px] text-[var(--muted)]">
        {title}
      </div>
      <table className="w-full min-w-[28rem] border-collapse text-left text-[12px]">
        <thead>
          <tr className="border-b border-[var(--aw-hairline,var(--border))] text-[var(--muted)]">
            {COLS.map((c) => (
              <th
                key={c}
                className="px-3 py-2 font-medium tracking-[-0.08px]"
              >
                {t(`optCol.${c}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!rows.length ? (
            <tr>
              <td
                colSpan={COLS.length}
                className="px-3 py-10 text-center text-[13px] text-[var(--muted)]"
              >
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr
                key={r.symbol}
                className="border-t border-[var(--aw-hairline,var(--border))]"
              >
                <td className="px-3 py-2 font-medium tabular-nums tracking-[-0.08px]">
                  {formatNumber(r.strike, { maximumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {r.last > 0
                    ? formatNumber(r.last, { maximumFractionDigits: 2 })
                    : "—"}
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {r.chgPct != null
                    ? `${formatNumber(r.chgPct, { maximumFractionDigits: 1 })}%`
                    : "—"}
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {r.iv != null
                    ? `${formatNumber(r.iv * (r.iv > 2 ? 1 : 100), {
                        maximumFractionDigits: 1,
                      })}%`
                    : "—"}
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {formatNumber(r.oi, { maximumFractionDigits: 0 })}
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {formatNumber(r.volume, { maximumFractionDigits: 0 })}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function EmptyChainArt() {
  return (
    <svg
      viewBox="0 0 160 100"
      className="h-14 w-auto text-[var(--brand)]"
      aria-hidden
    >
      <rect
        x="28"
        y="18"
        width="104"
        height="64"
        rx="0"
        fill="var(--panel)"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      <path
        d="M44 58h18M72 48h18M100 66h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        opacity="0.45"
      />
      <path
        d="M44 58V42M72 48V34M100 66V50"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        opacity="0.7"
      />
    </svg>
  );
}

export function SymbolDerivativesPanel({
  symbol,
  assetType,
  lastPrice,
}: {
  symbol: string;
  assetType: AssetType;
  lastPrice: number | null;
}) {
  const t = useTranslations("symbol");
  const [expiry, setExpiry] = useState("");

  const metaQuery = useMarketOptionsMeta(symbol, assetType);
  const meta = metaQuery.data;
  const unavailable =
    Boolean(meta?.unavailable) ||
    !(meta?.expiries?.length) ||
    metaQuery.isError;
  const expiries = unavailable ? [] : (meta?.expiries ?? []);
  const loading = metaQuery.isLoading;

  const metaError =
    meta?.code === "LB_CONN_LIMIT"
      ? t("derivativesConnLimit")
      : meta?.code === "LB_OPTION_PACKAGE"
        ? t("derivativesNoPackage")
        : typeof meta?.detail === "string"
          ? meta.detail
          : null;

  useEffect(() => {
    setExpiry("");
  }, [symbol, assetType]);

  useEffect(() => {
    if (!expiries.length) return;
    setExpiry((prev) => prev || expiries[0]!);
  }, [expiries]);

  const chainQuery = useMarketOptionsChain({
    symbol,
    assetType,
    expiry: expiry || null,
    spot: lastPrice ?? 0,
    enabled: Boolean(expiry) && !unavailable,
  });
  const chain = chainQuery.data;
  const calls = (chain?.calls ?? []) as OptionRow[];
  const puts = (chain?.puts ?? []) as OptionRow[];
  const chainError = chain?.unavailable
    ? chain.code === "LB_CONN_LIMIT"
      ? t("derivativesConnLimit")
      : chain.code === "LB_OPTION_PACKAGE"
        ? t("derivativesNoPackage")
        : typeof chain.detail === "string"
          ? chain.detail
          : t("derivativesEmpty")
    : chainQuery.isError
      ? t("derivativesEmpty")
      : metaError;

  const spot =
    lastPrice != null && lastPrice > 0
      ? formatNumber(lastPrice, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "—";
  const toolsHref =
    lastPrice != null && lastPrice > 0
      ? `/tools/options?symbol=${encodeURIComponent(symbol)}&spot=${lastPrice}`
      : `/tools/options?symbol=${encodeURIComponent(symbol)}`;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex h-9 shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-[var(--aw-hairline,var(--border))] px-4 text-[12px] sm:px-5">
        <label className="inline-flex items-center gap-1.5 text-[var(--muted)]">
          <span className="shrink-0">{t("expiry")}</span>
          <select
            disabled={unavailable || !expiries.length}
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="qt-input h-6 min-w-[9rem] rounded-none px-2 text-[12px] leading-none disabled:opacity-60"
            aria-label={t("expiry")}
          >
            {unavailable || !expiries.length ? (
              <option>{t("expiryUnavailable")}</option>
            ) : (
              expiries.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))
            )}
          </select>
        </label>
        <span className="text-[var(--muted)]">
          {t("underlyingSpot")}{" "}
          <span className="font-medium tabular-nums tracking-[-0.08px] text-[var(--foreground)]">
            {spot}
          </span>
        </span>
        <Link
          href={toolsHref}
          className="ml-auto text-[12px] font-medium text-[var(--brand-text)] hover:underline"
        >
          {t("openOptionsTool")} →
        </Link>
      </div>

      {loading ? (
        <p className="aw-caption flex min-h-0 flex-1 items-center justify-center">
          …
        </p>
      ) : unavailable ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
          <EmptyChainArt />
          <p className="max-w-md text-[13px] font-medium tracking-[-0.08px] text-[var(--foreground)]">
            {t("derivativesEmpty")}
          </p>
          {chainError ? (
            <p className="max-w-lg text-[12px] leading-relaxed text-[var(--muted)]">
              {chainError}
            </p>
          ) : null}
          <Link
            href="/advanced-quotes"
            className="mt-1 text-[12px] font-medium text-[var(--brand-text)] hover:underline"
          >
            {t("advancedQuotesLink")} →
          </Link>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 divide-y divide-[var(--aw-hairline,var(--border))] overflow-hidden lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          <OptionTable
            title={t("calls")}
            rows={calls}
            empty={chainError || t("derivativesEmpty")}
            flush
          />
          <OptionTable
            title={t("puts")}
            rows={puts}
            empty={chainError || t("derivativesEmpty")}
            flush
          />
        </div>
      )}

      <p className="aw-caption shrink-0 border-t border-[var(--aw-hairline,var(--border))] px-4 py-2.5 leading-relaxed sm:px-5">
        {t("derivativesDisclaimer")}
      </p>
    </div>
  );
}
