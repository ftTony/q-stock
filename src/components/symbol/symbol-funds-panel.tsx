"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatNumber } from "@/lib/format-number";
import type { CapitalSnapshot } from "@/lib/market/providers/longbridge-research";
import type { AssetType } from "@/lib/types";

function fmt(n: number) {
  if (Math.abs(n) >= 1e9) {
    return `${formatNumber(n / 1e9, { maximumFractionDigits: 2 })}B`;
  }
  if (Math.abs(n) >= 1e6) {
    return `${formatNumber(n / 1e6, { maximumFractionDigits: 2 })}M`;
  }
  if (Math.abs(n) >= 1e3) {
    return `${formatNumber(n / 1e3, { maximumFractionDigits: 1 })}K`;
  }
  return formatNumber(n, { maximumFractionDigits: 0 });
}

export function SymbolFundsPanel({
  symbol,
  assetType,
}: {
  symbol: string;
  assetType: AssetType;
}) {
  const t = useTranslations("symbol");
  const [data, setData] = useState<CapitalSnapshot | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch(
          `/api/market/capital?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
        );
        const json = await res.json();
        if (cancelled) return;
        if (json.unavailable || !json.inflow) {
          setUnavailable(true);
          setData(null);
          setDetail(
            typeof json.detail === "string" ? json.detail : null,
          );
        } else {
          setUnavailable(false);
          setDetail(null);
          setData(json as CapitalSnapshot);
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

  if (unavailable || !data) {
    return (
      <div className="space-y-2 py-6 text-center">
        <p className="text-[14px] font-semibold leading-[1.29] tracking-[-0.224px]">
          {t("fundsTitle")}
        </p>
        <p className="mx-auto max-w-md text-[12px] leading-[1.47] tracking-[-0.12px] text-[var(--muted)]">
          {t("fundsEmpty")}
        </p>
        {detail ? (
          <p className="mx-auto max-w-lg break-all text-[12px] tracking-[-0.12px] text-[var(--muted)] opacity-80">
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

  const rows = [
    { key: "large", label: t("fundsLarge") },
    { key: "medium", label: t("fundsMedium") },
    { key: "small", label: t("fundsSmall") },
  ] as const;

  return (
    <div className="space-y-3">
      <p className="text-[12px] font-medium text-[var(--muted)]">
        {t("fundsTitle")}
      </p>
      <div className="overflow-x-auto rounded-md border border-[var(--border)]">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--muted)]">
              <th className="px-3 py-2 font-normal">{t("fundsBucket")}</th>
              <th className="px-3 py-2 font-normal text-[var(--up)]">
                {t("fundsIn")}
              </th>
              <th className="px-3 py-2 font-normal text-[var(--down)]">
                {t("fundsOut")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-[var(--border)]/60">
                <td className="px-3 py-2">{r.label}</td>
                <td className="px-3 py-2 tabular-nums text-[var(--up)]">
                  {fmt(data.inflow[r.key])}
                </td>
                <td className="px-3 py-2 tabular-nums text-[var(--down)]">
                  {fmt(data.outflow[r.key])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
