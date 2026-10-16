"use client";

import { SymbolChipsPanel } from "@/components/symbol/symbol-chips-panel";
import { SymbolFundsPanel } from "@/components/symbol/symbol-funds-panel";
import { SymbolRailDepth } from "@/components/symbol/symbol-rail-depth";
import { SymbolShortPanel } from "@/components/symbol/symbol-short-panel";
import type { AssetType } from "@/lib/types";

type Props = {
  symbol: string;
  assetType: AssetType;
};

export function SymbolRailMarket({ symbol, assetType }: Props) {
  const showFunds = assetType === "stock" || assetType === "hk" || assetType === "cn";
  const showShort = assetType === "stock" || assetType === "hk";
  const showChips =
    assetType === "stock" || assetType === "hk" || assetType === "cn";

  return (
    <div className="space-y-2 bg-[var(--aw-parchment)] p-2">
      <div className="overflow-hidden rounded-[11px] border border-[var(--aw-hairline)] bg-[var(--aw-canvas)]">
        <SymbolRailDepth mode="split" symbol={symbol} assetType={assetType} />
      </div>
      {showFunds ? (
        <div className="rounded-[11px] border border-[var(--aw-hairline)] bg-[var(--aw-canvas)] p-2.5">
          <SymbolFundsPanel symbol={symbol} assetType={assetType} />
        </div>
      ) : null}
      {showShort ? (
        <div className="rounded-[11px] border border-[var(--aw-hairline)] bg-[var(--aw-canvas)] p-2.5">
          <SymbolShortPanel symbol={symbol} assetType={assetType} />
        </div>
      ) : null}
      {showChips ? (
        <div className="rounded-[11px] border border-[var(--aw-hairline)] bg-[var(--aw-canvas)] p-2.5">
          <SymbolChipsPanel symbol={symbol} assetType={assetType} />
        </div>
      ) : null}
    </div>
  );
}
