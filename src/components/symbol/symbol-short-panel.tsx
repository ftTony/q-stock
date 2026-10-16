"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatDate, formatNumber } from "@/lib/format-number";
import type { ShortRow } from "@/lib/market/providers/longbridge-research";
import type { AssetType } from "@/lib/types";

export function SymbolShortPanel({
  symbol,
  assetType,
}: {
  symbol: string;
  assetType: AssetType;
}) {
  const t = useTranslations("symbol");
  const [rows, setRows] = useState<ShortRow[]>([]);
  const [unavailable, setUnavailable] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch(
          `/api/market/short?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
        );
        const json = await res.json();
        if (cancelled) return;
        if (json.unavailable || !json.rows?.length) {
          setUnavailable(true);
          setRows([]);
          setDetail(typeof json.detail === "string" ? json.detail : null);
        } else {
          setUnavailable(false);
          setDetail(null);
          setRows(json.rows as ShortRow[]);
        }
      } catch {
        if (!cancelled) {
          setUnavailable(true);
          setDetail(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [symbol, assetType]);

  if (loading) {
    return (
      <div className="py-8 text-center text-[12px] text-[var(--muted)]">…</div>
    );
  }

  if (unavailable) {
    return (
      <div className="space-y-2 py-6 text-center">
        <p className="text-sm font-medium">{t("shortTitle")}</p>
        <p className="mx-auto max-w-md text-[12px] text-[var(--muted)]">
          {t("shortEmpty")}
        </p>
        {detail ? (
          <p className="mx-auto max-w-lg break-all text-[11px] text-[var(--muted)] opacity-80">
            {detail}
          </p>
        ) : null}
        <Link
          href="/advanced-quotes"
          className="inline-block text-[12px] text-[var(--brand-text)] hover:underline"
        >
          {t("advancedQuotesLink")} →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[12px] font-medium text-[var(--muted)]">
        {t("shortTitle")}
      </p>
      <div className="overflow-x-auto rounded-md border border-[var(--border)]">
        <table className="w-full min-w-[28rem] text-left text-[12px]">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--muted)]">
              <th className="px-2 py-1.5 font-normal">{t("shortDate")}</th>
              <th className="px-2 py-1.5 font-normal">{t("shortRate")}</th>
              <th className="px-2 py-1.5 font-normal">{t("shortClose")}</th>
              <th className="px-2 py-1.5 font-normal">{t("shortAmount")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.timestamp}-${i}`} className="border-b border-[var(--border)]/50">
                <td className="px-2 py-1.5 tabular-nums text-[var(--muted)]">
                  {r.timestamp ? formatDate(r.timestamp) : "—"}
                </td>
                <td className="px-2 py-1.5 tabular-nums">
                  {r.rate != null
                    ? `${formatNumber(r.rate, { maximumFractionDigits: 2 })}%`
                    : "—"}
                </td>
                <td className="px-2 py-1.5 tabular-nums">
                  {r.close != null
                    ? formatNumber(r.close, { maximumFractionDigits: 2 })
                    : "—"}
                </td>
                <td className="px-2 py-1.5 tabular-nums">
                  {r.totalAmount != null
                    ? formatNumber(r.totalAmount, { maximumFractionDigits: 0 })
                    : r.amount != null
                      ? formatNumber(r.amount, { maximumFractionDigits: 0 })
                      : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
