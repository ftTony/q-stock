"use client";

import type { FormEvent, PointerEvent as ReactPointerEvent } from "react";
import { SymbolOrderRail } from "@/components/symbol/rail/symbol-order-rail";
import { SymbolRailQuoteHeader } from "@/components/symbol/rail/symbol-rail-quote-header";
import { SymbolRailStats } from "@/components/symbol/rail/symbol-rail-stats";
import type { EarningsMetric } from "@/components/market/earnings-panel";
import type { AssetType, Quote } from "@/lib/types";

type Props = {
  symbol: string;
  assetType: AssetType;
  isIndex: boolean;
  quote: Quote | null;
  updatedAt: Date | null;
  inWatchlist: boolean;
  watchBusy: boolean;
  onToggleWatchlist: () => void;
  alertCondition: "gte" | "lte";
  onAlertConditionChange: (v: "gte" | "lte") => void;
  alertPrice: string;
  onAlertPriceChange: (v: string) => void;
  alertBusy: boolean;
  alertMessage: string | null;
  onAlertSubmit: (e: FormEvent) => void;
  metrics: EarningsMetric[];
  marketCap: number | null;
  focusPlanToken: number;
  onBoundStrategyChange: (name: string | null, id?: string | null) => void;
  onRequestOrder: () => void;
  dragging: boolean;
  onResizeStart: (e: ReactPointerEvent<HTMLElement>) => void;
};

/** Desktop-only plan / quote rail (hidden under lg via CSS + parent gate). */
export function SymbolDesktopRail({
  symbol,
  assetType,
  isIndex,
  quote,
  updatedAt,
  inWatchlist,
  watchBusy,
  onToggleWatchlist,
  alertCondition,
  onAlertConditionChange,
  alertPrice,
  onAlertPriceChange,
  alertBusy,
  alertMessage,
  onAlertSubmit,
  metrics,
  marketCap,
  focusPlanToken,
  onBoundStrategyChange,
  onRequestOrder,
  dragging,
  onResizeStart,
}: Props) {
  return (
    <>
      <button
        type="button"
        className="aw-workbench-resizer"
        aria-label="Resize side panel"
        data-dragging={dragging ? "true" : undefined}
        onPointerDown={onResizeStart}
      />

      <aside className="aw-workbench-rail min-h-0 overflow-hidden bg-[var(--aw-canvas)]">
        <div className="shrink-0">
          <SymbolRailQuoteHeader
            symbol={symbol}
            assetType={assetType}
            quote={quote}
            updatedAt={updatedAt}
            inWatchlist={inWatchlist}
            watchBusy={watchBusy}
            onToggleWatchlist={onToggleWatchlist}
            alert={{
              condition: alertCondition,
              onConditionChange: onAlertConditionChange,
              price: alertPrice,
              onPriceChange: onAlertPriceChange,
              busy: alertBusy,
              message: alertMessage,
              onSubmit: onAlertSubmit,
            }}
          />
          <SymbolRailStats
            quote={quote}
            metrics={metrics}
            assetType={assetType}
            marketCap={marketCap}
          />
        </div>
        <SymbolOrderRail
          symbol={symbol}
          assetType={assetType}
          isIndex={isIndex}
          onBoundStrategyChange={onBoundStrategyChange}
          focusPlanToken={focusPlanToken}
          onRequestOrder={onRequestOrder}
        />
      </aside>
    </>
  );
}
