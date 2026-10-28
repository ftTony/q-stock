"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { setBoundStrategyId } from "@/components/symbol/plan/symbol-plan-binding";
import { SymbolRailGuide } from "@/components/symbol/rail/symbol-rail-guide";
import { RailPanelSkeleton } from "@/components/ui/panel-skeleton";
import type { AssetType } from "@/lib/types";

const SymbolPlanPanel = dynamic(
  () =>
    import("@/components/symbol/plan/symbol-plan-panel").then((m) => ({
      default: m.SymbolPlanPanel,
    })),
  { ssr: false, loading: () => <RailPanelSkeleton rows={6} /> },
);

const SymbolReviewRail = dynamic(
  () =>
    import("@/components/symbol/rail/symbol-review-rail").then((m) => ({
      default: m.SymbolReviewRail,
    })),
  { ssr: false, loading: () => <RailPanelSkeleton rows={5} /> },
);

const SymbolRailMarket = dynamic(
  () =>
    import("@/components/symbol/rail/symbol-rail-market").then((m) => ({
      default: m.SymbolRailMarket,
    })),
  { ssr: false, loading: () => <RailPanelSkeleton rows={8} /> },
);

export type RailTab = "market" | "plan" | "review";

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
  /** Controlled tab (H5 quick actions). */
  tab?: RailTab;
  onTabChange?: (tab: RailTab) => void;
  /** Hide plan|review|market strip when parent owns navigation. */
  hideTabList?: boolean;
  /** Natural height for an outer scroll parent (no nested RailScroll). */
  embedInScroll?: boolean;
};

function RailScroll({
  children,
  embed,
}: {
  children: ReactNode;
  embed?: boolean;
}) {
  if (embed) {
    return <div className="flex flex-col">{children}</div>;
  }
  return (
    <div className="aw-rail-scroll flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain qt-scroll">
      <div className="flex min-h-full flex-1 flex-col">{children}</div>
    </div>
  );
}

/** Plan-first (PRD): market depth is opt-in, not the critical path. */
function defaultTab(): RailTab {
  return "plan";
}

export function SymbolOrderRail({
  symbol,
  assetType,
  isIndex = false,
  onBoundStrategyChange,
  focusPlanToken = 0,
  onRequestOrder,
  tab: tabProp,
  onTabChange,
  hideTabList = false,
  embedInScroll = false,
}: Props) {
  const t = useTranslations("symbolRail");
  const showMarket = assetType !== "crypto" && !isIndex;
  const controlled = tabProp !== undefined;
  const [innerTab, setInnerTab] = useState<RailTab>(() => defaultTab());
  const tab = controlled ? tabProp : innerTab;
  const setTab = useCallback(
    (next: RailTab) => {
      if (!controlled) setInnerTab(next);
      onTabChange?.(next);
    },
    [controlled, onTabChange],
  );
  const [strategyId, setStrategyId] = useState<string | null>(null);
  const [nameById, setNameById] = useState<Record<string, string>>({});

  useEffect(() => {
    if (focusPlanToken <= 0) return;
    setTab("plan");
  }, [focusPlanToken, setTab]);

  useEffect(() => {
    setStrategyId(null);
    if (!controlled) setInnerTab(defaultTab());
    onBoundStrategyChange?.(null, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset on symbol switch only
  }, [symbol, assetType]);

  useEffect(() => {
    if (!showMarket && tab === "market") setTab("plan");
  }, [showMarket, tab, setTab]);

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
    ...(showMarket
      ? ([{ value: "market" as const, label: t("market") }] as const)
      : []),
    { value: "plan", label: t("plan") },
    { value: "review", label: t("review") },
  ];

  return (
    <div
      className={
        embedInScroll
          ? "flex flex-col bg-[var(--aw-canvas)]"
          : "flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--aw-canvas)]"
      }
    >
      {hideTabList ? null : (
        <div
          role="tablist"
          className="flex shrink-0 items-stretch border-b border-[var(--aw-hairline,var(--border))]"
        >
          {railOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={tab === opt.value}
              data-active={tab === opt.value}
              data-tour={
                opt.value === "plan"
                  ? "rail-plan"
                  : opt.value === "review"
                    ? "rail-review"
                    : undefined
              }
              onClick={() => setTab(opt.value)}
              className="aw-tab flex-1 justify-center"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {hideTabList ? null : (
        <SymbolRailGuide
          onGoPlan={() => setTab("plan")}
          onGoOrder={() => setTab("plan")}
          onGoReview={() => setTab("review")}
        />
      )}

      {tab === "market" && showMarket ? (
        <RailScroll embed={embedInScroll}>
          <SymbolRailMarket symbol={symbol} assetType={assetType} />
        </RailScroll>
      ) : null}

      {tab === "plan" ? (
        <RailScroll embed={embedInScroll}>
          <SymbolPlanPanel
            symbol={symbol}
            assetType={assetType}
            strategyId={strategyId}
            onStrategyIdChange={handleStrategyIdChange}
            onGoOrder={() => onRequestOrder?.()}
          />
        </RailScroll>
      ) : null}

      {tab === "review" ? (
        <RailScroll embed={embedInScroll}>
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
