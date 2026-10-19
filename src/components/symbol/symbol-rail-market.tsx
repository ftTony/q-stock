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
    <div className="bg-[var(--aw-canvas)]">
      <SymbolRailDepth mode="split" symbol={symbol} assetType={assetType} />
      {showFunds ? (
        <div className="border-t border-[var(--aw-hairline)] px-3 py-3">
          <SymbolFundsPanel symbol={symbol} assetType={assetType} />
        </div>
      ) : null}
      {showShort ? (
        <div className="border-t border-[var(--aw-hairline)] px-3 py-3">
          <SymbolShortPanel symbol={symbol} assetType={assetType} />
        </div>
      ) : null}
      {showChips ? (
        <div className="border-t border-[var(--aw-hairline)] px-3 py-3">
          <SymbolChipsPanel symbol={symbol} assetType={assetType} />
        </div>
      ) : null}
    </div>
  );
}
