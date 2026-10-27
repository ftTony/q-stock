"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatNumber } from "@/lib/format-number";
import { SymbolFundsBars } from "@/components/symbol/symbol-funds-bars";
import { SymbolFundsDonut } from "@/components/symbol/symbol-funds-donut";
import type { CapitalSnapshot } from "@/lib/market/providers/longbridge-research";
import type { AssetType } from "@/lib/types";

function pickScale(total: number, zh: boolean) {
  if (zh && total >= 1e8) return { div: 1e8, unitKey: "fundsUnitYi" as const };
  if (zh && total >= 1e4) return { div: 1e4, unitKey: "fundsUnitWan" as const };
  if (total >= 1e9) return { div: 1e9, unitKey: "fundsUnitB" as const };
  if (total >= 1e6) return { div: 1e6, unitKey: "fundsUnitM" as const };
  return { div: 1, unitKey: null };
}

function fmtScaled(n: number, div: number) {
  const v = n / div;
  return formatNumber(v, {
    maximumFractionDigits: div >= 1e4 ? 2 : 0,
    minimumFractionDigits: div >= 1e4 ? 2 : 0,
  });
}

export function SymbolFundsPanel({
  symbol,
  assetType,
}: {
  symbol: string;
  assetType: AssetType;
}) {
  const t = useTranslations("symbol");
  const locale = useLocale();
  const zh = locale.startsWith("zh");
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
          setDetail(typeof json.detail === "string" ? json.detail : null);
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

  const summary = useMemo(() => {
    if (!data) return null;
    const inflow =
      data.inflow.large + data.inflow.medium + data.inflow.small;
    const outflow =
      data.outflow.large + data.outflow.medium + data.outflow.small;
    const net = inflow - outflow;
    const total = inflow + outflow;
    const scale = pickScale(Math.max(total, Math.abs(net)), zh);
    return { inflow, outflow, net, total, scale };
  }, [data, zh]);

  if (loading) {
    return (
      <div className="py-8 text-center text-[12px] text-[var(--muted)]">…</div>
    );
  }

  if (unavailable || !data || !summary || !(summary.total > 0)) {
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

  const netPositive = summary.net >= 0;
  const { div, unitKey } = summary.scale;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <div className="min-w-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="text-[12px] font-semibold tracking-tight text-[var(--foreground)]">
            {t("fundsTitle")}
          </p>
          <p className="text-[11px] tabular-nums leading-none">
            <span className="text-[var(--muted)]">
              {netPositive ? t("fundsNetIn") : t("fundsNetOut")}
              {": "}
            </span>
            <span
              className={
                netPositive ? "text-[var(--up)]" : "text-[var(--down)]"
              }
            >
              {fmtScaled(Math.abs(summary.net), div)}
            </span>
          </p>
        </div>
        {unitKey ? (
          <span className="shrink-0 text-[10px] text-[var(--muted)]">
            {t(unitKey)}
          </span>
        ) : null}
      </div>

      <SymbolFundsDonut data={data} />

      <SymbolFundsBars
        data={data}
        fmt={(n) => fmtScaled(n, div)}
        labels={{
          inflow: t("fundsIn"),
          outflow: t("fundsOut"),
          large: t("fundsLarge"),
          medium: t("fundsMedium"),
          small: t("fundsSmall"),
        }}
      />
    </div>
  );
}
