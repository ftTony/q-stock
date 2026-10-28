"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SymbolShortChart } from "@/components/symbol/panels/symbol-short-chart";
import { RailPanelSkeleton } from "@/components/ui/panel-skeleton";
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
    return <RailPanelSkeleton rows={4} />;
  }

  if (unavailable || rows.length === 0) {
    return (
      <div className="space-y-2 py-6 text-center">
        <p className="text-[12px] font-semibold tracking-tight">
          {t("shortTitle")}
        </p>
        <p className="mx-auto max-w-md text-[12px] leading-relaxed text-[var(--muted)]">
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
    <div className="space-y-2">
      <p className="text-[12px] font-semibold tracking-tight text-[var(--foreground)]">
        {t("shortTitle")}
      </p>
      <SymbolShortChart
        rows={rows}
        labels={{ rate: t("shortRate"), close: t("shortClose") }}
      />
    </div>
  );
}
