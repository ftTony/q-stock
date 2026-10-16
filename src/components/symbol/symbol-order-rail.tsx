"use client";

import { Suspense, useCallback, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { TradePanel } from "@/components/trading/trade-panel";
import { AiScenarioPanel } from "@/components/market/ai-scenario-panel";
import { SymbolRailMarket } from "@/components/symbol/symbol-rail-market";
import { SymbolPaperRiskBar } from "@/components/symbol/symbol-paper-risk-bar";
import type { AssetType } from "@/lib/types";

export type AiOrderDraft = {
  side: "buy" | "sell";
  type: "limit" | "stop";
  price: number;
  qtyHint?: number;
  invalidationNote?: string;
  nonce: number;
};

export type RailTab = "market" | "order" | "calm";

type Props = {
  symbol: string;
  assetType: AssetType;
  lastPrice: number | null;
  bid?: number | null;
  ask?: number | null;
  onOpenAi?: () => void;
  /** Fired when paper cash/positions reload (e.g. after fill). */
  onAccountChange?: () => void;
  /** Index / crypto: hide L2 book & ticks tabs. */
  isIndex?: boolean;
  /** Mobile: hide depth tabs into "more" handled by parent — keep 4 here for desktop. */
  compact?: boolean;
};

/** Only 行情 / 交易 scroll; 冷静 follows natural height. */
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
  lastPrice,
  bid = null,
  ask = null,
  onOpenAi,
  onAccountChange,
  isIndex = false,
}: Props) {
  const t = useTranslations("symbolRail");
  const showDepth = assetType !== "crypto" && !isIndex;
  const [tab, setTab] = useState<RailTab>(showDepth ? "market" : "order");
  const [cashBalance, setCashBalance] = useState<number | null>(null);
  const [accountTick, setAccountTick] = useState(0);
  const [aiDraft, setAiDraft] = useState<AiOrderDraft | null>(null);

  const handleCashBalance = useCallback(
    (cash: number | null) => {
      setCashBalance(cash);
      setAccountTick((n) => n + 1);
      onAccountChange?.();
    },
    [onAccountChange],
  );

  const railOptions: { value: RailTab; label: string }[] = [
    ...(showDepth ? [{ value: "market" as const, label: t("market") }] : []),
    { value: "order", label: t("order") },
    { value: "calm", label: t("calm") },
  ];

  const activeTab = !showDepth && tab === "market" ? "order" : tab;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--aw-canvas)]">
      <div className="shrink-0">
        <SymbolPaperRiskBar
          symbol={symbol}
          assetType={assetType}
          lastPrice={lastPrice}
          refreshKey={accountTick}
        />
      </div>
      <div
        role="tablist"
        className="flex shrink-0 border-b border-[var(--border)]"
      >
        {railOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={activeTab === opt.value}
            data-active={activeTab === opt.value}
            onClick={() => setTab(opt.value)}
            className="aw-tab flex-1 justify-center"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {showDepth && activeTab === "market" ? (
        <RailScroll>
          <SymbolRailMarket symbol={symbol} assetType={assetType} />
        </RailScroll>
      ) : null}

      {activeTab === "order" ? (
        <RailScroll>
          <Suspense
            fallback={
              <div className="p-4 text-sm text-[var(--muted)]">
                {t("order")}…
              </div>
            }
          >
            <TradePanel
              symbol={symbol}
              assetType={assetType}
              lastPrice={lastPrice}
              bid={bid}
              ask={ask}
              aiDraft={aiDraft}
              onDismissAiDraft={() => setAiDraft(null)}
              onCashBalance={handleCashBalance}
              onOpenCalm={() => setTab("calm")}
              onOpenAi={onOpenAi}
            />
          </Suspense>
        </RailScroll>
      ) : null}

      {activeTab === "calm" ? (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain qt-scroll">
          <AiScenarioPanel
            symbol={symbol}
            assetType={assetType}
            cashBalance={cashBalance}
            onApplyDraft={(draft) => {
              setAiDraft({ ...draft, nonce: Date.now() });
              setTab("order");
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
