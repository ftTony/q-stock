"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { CandleChart } from "@/components/charts/candle-chart";
import type { IndicatorFlags } from "@/components/charts/candle-chart-overlays";
import { useSymbolCandlesQuery } from "@/hooks/query/use-symbol-candles-query";
import { SymbolSearchField } from "@/components/ui/symbol-search-field";
import { ChartLoadingOverlay } from "@/components/ui/panel-skeleton";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { displayName } from "@/lib/market-names";
import type { AssetType, CandleResolution, SearchResult } from "@/lib/types";
import type { MultiChartLeg } from "@/components/multi-chart/use-multi-chart-layout";

type Props = {
  leg: MultiChartLeg | null;
  resolution: CandleResolution;
  flags: IndicatorFlags;
  onChange: (leg: MultiChartLeg | null) => void;
};

function PaneSearch({
  onPick,
  initialType = "stock",
  compact = false,
}: {
  onPick: (leg: MultiChartLeg) => void;
  initialType?: AssetType;
  compact?: boolean;
}) {
  const t = useTranslations("multiChart");
  const tMarket = useTranslations("market");
  const [searchType, setSearchType] = useState<AssetType>(initialType);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setSearchType(initialType);
  }, [initialType]);

  function pick(r: SearchResult) {
    onPick({
      assetType: r.assetType,
      symbol: r.symbol.toUpperCase(),
    });
    setDraft("");
  }

  return (
    <div
      className={`flex min-w-0 flex-col gap-1 ${compact ? "flex-1" : "w-full"}`}
    >
      <SegmentedControl
        value={searchType}
        onChange={(v) => setSearchType(v as AssetType)}
        className="h-7 w-fit items-stretch rounded-md border border-[var(--border)] bg-[var(--background)] p-0.5"
        buttonClassName="inline-flex items-center px-2 text-[11px] font-medium leading-none"
        options={[
          { value: "stock", label: tMarket("stocks") },
          { value: "hk", label: tMarket("hk") },
          { value: "cn", label: tMarket("cn") },
          { value: "crypto", label: tMarket("crypto") },
        ]}
      />
      <SymbolSearchField
        value={draft}
        assetType={searchType}
        onChange={setDraft}
        onSelect={pick}
        label={compact ? t("replaceSymbol") : t("addSymbol")}
        placeholder={t("searchPlaceholder")}
        className="w-full [&_label>span]:text-[11px] [&_input]:mt-0.5 [&_input]:py-1.5"
      />
    </div>
  );
}

function PaneChart({
  leg,
  resolution,
  flags,
}: {
  leg: MultiChartLeg;
  resolution: CandleResolution;
  flags: IndicatorFlags;
}) {
  const t = useTranslations("multiChart");
  const tSymbol = useTranslations("symbol");
  const candles = useSymbolCandlesQuery(leg.symbol, leg.assetType, resolution);

  if (candles.loadingChart) {
    return <ChartLoadingOverlay label={t("loading")} />;
  }
  if (!candles.bars.length) {
    return (
      <div className="flex h-full min-h-[220px] items-center justify-center px-4 text-center text-[13px] text-[var(--muted)]">
        {tSymbol("chartEmpty")}
      </div>
    );
  }

  return (
    <CandleChart
      bars={candles.bars}
      flags={flags}
      showFloatingIndicators={false}
      showFloatingChrome={false}
      showDrawingTools={false}
      fillParent
      resetKey={`${leg.assetType}:${leg.symbol}:${resolution}`}
      resolution={resolution}
      symbol={leg.symbol}
      assetType={leg.assetType}
      onLoadMore={candles.loadMoreCandles}
      loadingMore={candles.loadingMoreCandles}
      hasMore={candles.hasMoreCandles}
    />
  );
}

export function MultiChartPane({ leg, resolution, flags, onChange }: Props) {
  const t = useTranslations("multiChart");
  const [replacing, setReplacing] = useState(false);
  const name = useMemo(
    () => (leg ? displayName(leg.symbol, leg.assetType) : ""),
    [leg],
  );

  useEffect(() => {
    setReplacing(false);
  }, [leg?.assetType, leg?.symbol]);

  return (
    <div className="flex min-h-0 min-w-0 flex-col overflow-hidden border border-[var(--border)] bg-[var(--panel)]">
      <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-[var(--border)] px-2 py-1.5">
        {!leg || replacing ? (
          <>
            <PaneSearch
              compact={Boolean(leg)}
              initialType={leg?.assetType ?? "stock"}
              onPick={(next) => {
                onChange(next);
                setReplacing(false);
              }}
            />
            {leg ? (
              <button
                type="button"
                className="qt-btn qt-btn-ghost h-7 shrink-0 px-2 text-[11px] text-[var(--muted)]"
                onClick={() => setReplacing(false)}
              >
                {t("cancelReplace")}
              </button>
            ) : null}
          </>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold tabular-nums leading-tight">
                {leg.symbol}
              </div>
              {name ? (
                <div className="truncate text-[11px] text-[var(--muted)]">
                  {name}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="qt-btn qt-btn-ghost h-7 shrink-0 px-2 text-[11px]"
              onClick={() => setReplacing(true)}
            >
              {t("replace")}
            </button>
            <Link
              href={`/symbol/${leg.assetType}/${encodeURIComponent(leg.symbol)}`}
              className="qt-btn qt-btn-ghost h-7 shrink-0 px-2 text-[11px]"
            >
              {t("openSymbol")}
            </Link>
            <button
              type="button"
              className="qt-btn qt-btn-ghost h-7 shrink-0 px-2 text-[11px] text-[var(--muted)]"
              onClick={() => onChange(null)}
            >
              {t("clear")}
            </button>
          </>
        )}
      </div>

      <div className="relative min-h-[220px] flex-1">
        {!leg ? (
          <div className="flex h-full min-h-[220px] items-center justify-center px-4 text-center text-[13px] text-[var(--muted)]">
            {t("emptyPane")}
          </div>
        ) : (
          <PaneChart leg={leg} resolution={resolution} flags={flags} />
        )}
      </div>
    </div>
  );
}
