"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  buildVolumeProfile,
  type VolumeProfile,
} from "@/lib/charts/volume-profile";
import { formatNumber } from "@/lib/format-number";
import type { AssetType, OhlcvBar } from "@/lib/types";

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
        // Prefer session 1m; fall back to daily.
        let bars: OhlcvBar[] = [];
        for (const resolution of ["T", "D"] as const) {
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
        const profile = buildVolumeProfile(bars, 24);
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

  if (loading) {
    return (
      <div className="py-8 text-center text-[12px] text-[var(--muted)]">…</div>
    );
  }

  if (unavailable || !vp) {
    return (
      <div className="space-y-2 py-6 text-center">
        <p className="text-sm font-medium">{t("chipsTitle")}</p>
        <p className="mx-auto max-w-md text-[12px] text-[var(--muted)]">
          {t("chipsEmpty")}
        </p>
        <p className="text-[11px] text-[var(--muted)]">{t("chipsHint")}</p>
      </div>
    );
  }

  const maxPct = Math.max(1, ...vp.buckets.map((b) => b.pct));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[12px]">
        <p className="font-medium text-[var(--muted)]">{t("chipsTitle")}</p>
        {vp.poc != null ? (
          <span className="tabular-nums">
            POC{" "}
            <strong>
              {formatNumber(vp.poc, { maximumFractionDigits: 2 })}
            </strong>
          </span>
        ) : null}
        {vp.val != null && vp.vah != null ? (
          <span className="tabular-nums text-[var(--muted)]">
            VA{" "}
            {formatNumber(vp.val, { maximumFractionDigits: 2 })}–
            {formatNumber(vp.vah, { maximumFractionDigits: 2 })}
          </span>
        ) : null}
      </div>
      <p className="text-[11px] text-[var(--muted)]">{t("chipsHint")}</p>
      <div className="space-y-1">
        {[...vp.buckets].reverse().map((b) => (
          <div
            key={b.price}
            className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-2 text-[11px] tabular-nums"
          >
            <span className="text-[var(--muted)]">
              {formatNumber(b.price, { maximumFractionDigits: 2 })}
            </span>
            <div className="h-2 overflow-hidden rounded-sm bg-[var(--surface-2)]">
              <div
                className="h-full rounded-sm bg-[var(--brand)]/45"
                style={{ width: `${(b.pct / maxPct) * 100}%` }}
              />
            </div>
            <span className="text-right text-[var(--muted)]">
              {formatNumber(b.pct, { maximumFractionDigits: 1 })}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
