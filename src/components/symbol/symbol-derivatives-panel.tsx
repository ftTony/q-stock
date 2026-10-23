"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
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
      className={`min-w-0 overflow-x-auto ${
        flush ? "" : "rounded-md border border-[var(--border)]"
      }`}
    >
      <div className="border-b border-[var(--aw-hairline,var(--border))] px-2 py-1.5 text-[13px] font-medium tracking-[-0.08px]">
        {title}
      </div>
      <table className="w-full min-w-[28rem] border-collapse text-left text-[12px]">
        <thead>
          <tr className="text-[var(--muted)]">
            {COLS.map((c) => (
              <th key={c} className="px-2 py-1.5 font-normal">
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
                className="px-2 py-8 text-center text-[var(--muted)]"
              >
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.symbol} className="border-t border-[var(--border)]/50">
                <td className="px-2 py-1.5 font-medium tabular-nums">
                  {formatNumber(r.strike, { maximumFractionDigits: 2 })}
                </td>
                <td className="px-2 py-1.5 tabular-nums">
                  {r.last > 0
                    ? formatNumber(r.last, { maximumFractionDigits: 2 })
                    : "—"}
                </td>
                <td className="px-2 py-1.5 tabular-nums">
                  {r.chgPct != null
                    ? `${formatNumber(r.chgPct, { maximumFractionDigits: 1 })}%`
                    : "—"}
                </td>
                <td className="px-2 py-1.5 tabular-nums">
                  {r.iv != null
                    ? `${formatNumber(r.iv * (r.iv > 2 ? 1 : 100), {
                        maximumFractionDigits: 1,
                      })}%`
                    : "—"}
                </td>
                <td className="px-2 py-1.5 tabular-nums">
                  {formatNumber(r.oi, { maximumFractionDigits: 0 })}
                </td>
                <td className="px-2 py-1.5 tabular-nums">
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
  const [expiries, setExpiries] = useState<string[]>([]);
  const [expiry, setExpiry] = useState("");
  const [calls, setCalls] = useState<OptionRow[]>([]);
  const [puts, setPuts] = useState<OptionRow[]>([]);
  const [unavailable, setUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chainError, setChainError] = useState<string | null>(null);

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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch(
          `/api/market/options?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
        );
        const json = await res.json();
        if (cancelled) return;
        if (json.unavailable || !json.expiries?.length) {
          setUnavailable(true);
          setExpiries([]);
          setExpiry("");
          setChainError(
            json.code === "LB_CONN_LIMIT"
              ? t("derivativesConnLimit")
              : json.code === "LB_OPTION_PACKAGE"
                ? t("derivativesNoPackage")
                : typeof json.detail === "string"
                  ? json.detail
                  : null,
          );
        } else {
          setUnavailable(false);
          setChainError(null);
          setExpiries(json.expiries as string[]);
          setExpiry((prev) => prev || (json.expiries[0] as string));
        }
      } catch {
        if (!cancelled) {
          setUnavailable(true);
          setChainError(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [symbol, assetType, t]);

  useEffect(() => {
    if (!expiry || unavailable) return;
    let cancelled = false;
    void (async () => {
      try {
        const qs = new URLSearchParams({
          symbol,
          assetType,
          expiry,
          spot: String(lastPrice ?? 0),
        });
        const res = await fetch(`/api/market/options?${qs}`);
        const json = await res.json();
        if (cancelled) return;
        if (json.unavailable) {
          setCalls([]);
          setPuts([]);
          setChainError(
            json.code === "LB_CONN_LIMIT"
              ? t("derivativesConnLimit")
              : json.code === "LB_OPTION_PACKAGE"
                ? t("derivativesNoPackage")
                : typeof json.detail === "string"
                  ? json.detail
                  : t("derivativesEmpty"),
          );
        } else {
          setCalls(json.calls ?? []);
          setPuts(json.puts ?? []);
          setChainError(null);
        }
      } catch {
        if (!cancelled) {
          setCalls([]);
          setPuts([]);
          setChainError(t("derivativesEmpty"));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [symbol, assetType, expiry, lastPrice, unavailable, t]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px]">
        <label className="inline-flex items-center gap-1.5 text-[var(--muted)]">
          {t("expiry")}
          <select
            disabled={unavailable || !expiries.length}
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="h-7 rounded border border-[var(--border)] bg-[var(--panel)] px-2 text-[12px] text-[var(--foreground)] disabled:opacity-70"
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
          <span className="font-medium tabular-nums text-[var(--foreground)]">
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
        <div className="py-10 text-center text-[12px] text-[var(--muted)]">…</div>
      ) : unavailable ? (
        <div className="space-y-2 py-8 text-center">
          <p className="text-[12px] text-[var(--muted)]">
            {t("derivativesEmpty")}
          </p>
          {chainError ? (
            <p className="aw-caption mx-auto max-w-lg break-all opacity-80">
              {chainError}
            </p>
          ) : null}
          <Link
            href="/advanced-quotes"
            className="inline-block text-[12px] text-[var(--brand-text)] hover:underline"
          >
            {t("advancedQuotesLink")} →
          </Link>
        </div>
      ) : (
        <div className="grid divide-y divide-[var(--border)] overflow-hidden rounded-md border border-[var(--border)] lg:grid-cols-2 lg:divide-x lg:divide-y-0">
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

      <p className="aw-caption leading-relaxed">
        {t("derivativesDisclaimer")}
      </p>
    </div>
  );
}
