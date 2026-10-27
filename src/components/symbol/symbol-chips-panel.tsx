"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { SymbolChipsChart } from "@/components/symbol/symbol-chips-chart";
import { RailPanelSkeleton } from "@/components/ui/panel-skeleton";
import {
  buildVolumeProfile,
  type VolumeProfile,
} from "@/lib/charts/volume-profile";
import { formatDate, formatNumber } from "@/lib/format-number";
import type { AssetType, OhlcvBar } from "@/lib/types";

function px(n: number | null) {
  if (n == null) return "—";
  return formatNumber(n, { maximumFractionDigits: 2 });
}

function pct(n: number | null) {
  if (n == null) return "—";
  return `${formatNumber(n, { maximumFractionDigits: 2 })}%`;
}

export function SymbolChipsPanel({
  symbol,
  assetType,
}: {
  symbol: string;
  assetType: AssetType;
}) {
  const t = useTranslations("symbol");
  const [vp, setVp] = useState<VolumeProfile | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        let bars: OhlcvBar[] = [];
        for (const resolution of ["D", "T"] as const) {
          const res = await fetch(
            `/api/candles?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}&resolution=${resolution}&indicators=0`,
          );
          const json = await res.json();
          if (res.ok && Array.isArray(json.bars) && json.bars.length >= 8) {
            bars = json.bars as OhlcvBar[];
            break;
          }
        }
        if (cancelled) return;
        const profile = buildVolumeProfile(bars, 48);
        if (!profile.buckets.length) {
          setUnavailable(true);
          setVp(null);
        } else {
          setUnavailable(false);
          setVp(profile);
        }
      } catch {
        if (!cancelled) setUnavailable(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [symbol, assetType]);

  const dateLabel = useMemo(() => {
    if (!vp?.toTs) return undefined;
    return formatDate(vp.toTs * (vp.toTs < 1e12 ? 1000 : 1));
  }, [vp]);

  if (loading) {
    return <RailPanelSkeleton rows={4} />;
  }

  if (unavailable || !vp) {
    return (
      <div className="space-y-2 py-6 text-center">
        <p className="text-[14px] font-semibold leading-[1.29] tracking-[-0.224px]">
          {t("chipsTitle")}
        </p>
        <p className="mx-auto max-w-md text-[12px] leading-[1.47] tracking-[-0.12px] text-[var(--muted)]">
          {t("chipsEmpty")}
        </p>
        <p className="text-[11px] tracking-[-0.1px] text-[var(--muted)]">
          {t("chipsHint")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-[12px] font-semibold leading-none tracking-[-0.12px] text-[var(--aw-ink,var(--foreground))]">
          {t("chipsTitle")}
        </p>
        {dateLabel ? (
          <span className="text-[11px] tabular-nums text-[var(--muted)]">
            {t("chipsDate", { date: dateLabel })}
          </span>
        ) : null}
      </div>
      <p className="text-[11px] leading-snug tracking-[-0.1px] text-[var(--muted)]">
        {t("chipsHint")}
      </p>

      <SymbolChipsChart profile={vp} dateLabel={dateLabel} />

      <div className="space-y-2">
        <p className="text-[13px] font-semibold tabular-nums leading-none tracking-[-0.12px]">
          {t("chipsProfit")}{" "}
          <span className="text-[var(--foreground)]">{pct(vp.profitPct)}</span>
        </p>

        <ul className="space-y-1.5 text-[12px] leading-none tracking-[-0.12px]">
          <li className="flex items-center gap-2 tabular-nums">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-[2px]"
              style={{ background: "#e89a3c" }}
            />
            <span className="text-[var(--muted)]">{t("chipsResist")}</span>
            <span className="font-medium">{px(vp.vah)}</span>
          </li>
          <li className="flex items-center gap-2 tabular-nums">
            <span className="inline-block h-2 w-2 shrink-0 rounded-[2px] bg-[var(--muted)]" />
            <span className="text-[var(--muted)]">{t("chipsAvgCost")}</span>
            <span className="font-medium">{px(vp.avgCost)}</span>
          </li>
          <li className="flex items-center gap-2 tabular-nums">
            <span className="inline-block h-2 w-2 shrink-0 rounded-[2px] bg-[var(--brand)]" />
            <span className="text-[var(--muted)]">{t("chipsSupport")}</span>
            <span className="font-medium">{px(vp.val)}</span>
          </li>
        </ul>

        <div className="space-y-1 text-[11px] leading-snug tracking-[-0.1px] text-[var(--muted)]">
          {vp.concentrationPct != null ? (
            <p className="tabular-nums">
              {t("chipsConcentration")}{" "}
              <span className="text-[var(--foreground)]">
                {pct(vp.concentrationPct)}
              </span>
            </p>
          ) : null}
          <p className="flex flex-wrap items-baseline gap-x-1.5 tabular-nums">
            <span
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-[1px]"
              style={{
                background: "color-mix(in srgb, var(--brand) 55%, transparent)",
              }}
            />
            {t("chipsRange90")}{" "}
            <span className="text-[var(--foreground)]">
              {px(vp.r90Lo)}~{px(vp.r90Hi)}
            </span>
          </p>
          <p className="tabular-nums opacity-80">
            {t("chipsRange70")}{" "}
            <span>
              {px(vp.val)}~{px(vp.vah)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
