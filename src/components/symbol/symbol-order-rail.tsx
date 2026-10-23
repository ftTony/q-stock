"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { setBoundStrategyId } from "@/components/symbol/symbol-plan-binding";
import type { AssetType } from "@/lib/types";

const SymbolPlanPanel = dynamic(
  () =>
    import("@/components/symbol/symbol-plan-panel").then((m) => ({
      default: m.SymbolPlanPanel,
    })),
  { ssr: false },
);

const SymbolReviewRail = dynamic(
  () =>
    import("@/components/symbol/symbol-review-rail").then((m) => ({
      default: m.SymbolReviewRail,
    })),
  { ssr: false },
);

const SymbolRailMarket = dynamic(
  () =>
    import("@/components/symbol/symbol-rail-market").then((m) => ({
      default: m.SymbolRailMarket,
    })),
  { ssr: false },
);

export type RailTab = "plan" | "review";

type Props = {
  symbol: string;
  assetType: AssetType;
  isIndex?: boolean;
  /** Notify quote bar of bound strategy name (+ id for trade drawer). */
  onBoundStrategyChange?: (
    name: string | null,
    id?: string | null,
  ) => void;
  /** Increment to force Plan tab (e.g. quote bar rule badge). */
  focusPlanToken?: number;
  /** Open trade in parent drawer (side icon / plan CTA). */
  onRequestOrder?: () => void;
};

function RailScroll({ children }: { children: ReactNode }) {
  return (
    <div className="aw-rail-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain qt-scroll">
      {children}
    </div>
  );
}

export function SymbolOrderRail({
  symbol,
  assetType,
  isIndex = false,
  onBoundStrategyChange,
  focusPlanToken = 0,
  onRequestOrder,
}: Props) {
  const t = useTranslations("symbolRail");
  const showDepth = assetType !== "crypto" && !isIndex;
  const [tab, setTab] = useState<RailTab>("plan");
  const [marketOpen, setMarketOpen] = useState(false);
  const [strategyId, setStrategyId] = useState<string | null>(null);
  const [nameById, setNameById] = useState<Record<string, string>>({});

  useEffect(() => {
    if (focusPlanToken <= 0) return;
    setMarketOpen(false);
    setTab("plan");
  }, [focusPlanToken]);

  useEffect(() => {
    setStrategyId(null);
    setMarketOpen(false);
    setTab("plan");
    onBoundStrategyChange?.(null, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset on symbol switch only
  }, [symbol, assetType]);

  const handleStrategyIdChange = useCallback(
    (id: string | null, name?: string | null) => {
      setBoundStrategyId(assetType, symbol, id);
      setStrategyId(id);
      if (!id) {
        onBoundStrategyChange?.(null, null);
        return;
      }
      if (name) {
        setNameById((m) => ({ ...m, [id]: name }));
        onBoundStrategyChange?.(name, id);
      } else {
        onBoundStrategyChange?.(null, id);
      }
    },
    [onBoundStrategyChange, assetType, symbol],
  );

  const railOptions: { value: RailTab; label: string }[] = [
    { value: "plan", label: t("plan") },
    { value: "review", label: t("review") },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--aw-canvas)]">
      <div
        role="tablist"
        className="flex shrink-0 items-stretch border-b border-[var(--border)]"
      >
        {railOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={!marketOpen && tab === opt.value}
            data-active={!marketOpen && tab === opt.value}
            onClick={() => {
              setMarketOpen(false);
              setTab(opt.value);
            }}
            className="aw-tab flex-1 justify-center"
          >
            {opt.label}
          </button>
        ))}
        {showDepth ? (
          <button
            type="button"
            role="tab"
            aria-selected={marketOpen}
            data-active={marketOpen}
            onClick={() => setMarketOpen(true)}
            className="aw-tab flex-1 justify-center"
          >
            {t("market")}
          </button>
        ) : null}
      </div>

      {showDepth && marketOpen ? (
        <RailScroll>
          <SymbolRailMarket symbol={symbol} assetType={assetType} />
        </RailScroll>
      ) : null}

      {!marketOpen && tab === "plan" ? (
        <RailScroll>
          <SymbolPlanPanel
            symbol={symbol}
            assetType={assetType}
            strategyId={strategyId}
            onStrategyIdChange={handleStrategyIdChange}
            onGoOrder={() => onRequestOrder?.()}
          />
        </RailScroll>
      ) : null}

      {!marketOpen && tab === "review" ? (
        <RailScroll>
          <SymbolReviewRail
            symbol={symbol}
            assetType={assetType}
            strategyNameById={nameById}
            onOpenPlan={() => setTab("plan")}
          />
        </RailScroll>
      ) : null}
    </div>
  );
}
