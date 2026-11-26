"use client";

import { Suspense, useCallback } from "react";
import dynamic from "next/dynamic";
import { TradePanel } from "@/components/symbol/page/symbol-page-dynamics";
import { PanelSkeleton } from "@/components/ui/panel-skeleton";
import type { AssetType } from "@/lib/types";

const SymbolTradeDesk = dynamic(
  () =>
    import("@/components/symbol/trade-desk/symbol-trade-desk").then((m) => ({
      default: m.SymbolTradeDesk,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-0 flex-1 p-4">
        <PanelSkeleton rows={4} />
      </div>
    ),
  },
);

type TradeDockView = "desk" | "ticket";

type Props = {
  view: TradeDockView;
  onViewChange: (v: TradeDockView) => void;
  /** Stack layout: desk lives in bottom strip — dock is ticket-only. */
  ticketOnly?: boolean;
  symbol: string;
  assetType: AssetType;
  lastPrice: number | null;
  percentChange: number | null;
  quoteName: string | null;
  bid: number | null;
  ask: number | null;
  strategyId: string | null;
  strategyName: string | null;
  onOpenAi: () => void;
  onOpenPlan: () => void;
  onOpenSymbolReview?: (orderId?: string | null) => void;
  loadingLabel: string;
};

/** Trade dock body: side may show desk; ticket is the primary order surface. */
export function SymbolDockTradeBody({
  view,
  onViewChange,
  ticketOnly = false,
  symbol,
  assetType,
  lastPrice,
  percentChange,
  quoteName,
  bid,
  ask,
  strategyId,
  strategyName,
  onOpenAi,
  onOpenPlan,
  onOpenSymbolReview,
  loadingLabel,
}: Props) {
  const showDesk = !ticketOnly && view === "desk";
  const openTicket = useCallback(() => {
    onViewChange("ticket");
  }, [onViewChange]);

  if (showDesk) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SymbolTradeDesk
          symbol={symbol}
          assetType={assetType}
          lastPrice={lastPrice}
          onOpenOrder={openTicket}
          layout="column"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Suspense
        fallback={
          <div className="min-h-0 flex-1 p-4">
            <PanelSkeleton rows={5} label={loadingLabel} />
          </div>
        }
      >
        <TradePanel
          symbol={symbol}
          assetType={assetType}
          lastPrice={lastPrice}
          percentChange={percentChange}
          quoteName={quoteName}
          bid={bid}
          ask={ask}
          onOpenAi={onOpenAi}
          onOpenPlan={onOpenPlan}
          onOpenSymbolReview={onOpenSymbolReview}
          strategyId={strategyId ?? ""}
          strategyName={strategyName}
        />
      </Suspense>
    </div>
  );
}
