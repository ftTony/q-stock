"use client";

import { useTranslations } from "next-intl";
import { SymbolOrderRail } from "@/components/symbol/rail/symbol-order-rail";
import { SideDrawer } from "@/components/ui/side-drawer";
import type { AssetType } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  symbol: string;
  assetType: AssetType;
  isIndex: boolean;
  focusPlanToken: number;
  onBoundStrategyChange: (name: string | null, id?: string | null) => void;
  onRequestOrder: () => void;
  /** Leave room for fixed H5 side dock. */
  edgeOffsetPx?: number;
};

/** H5 / tablet: plan · review · market as drawer (PRD §3.3–3.4). */
export function SymbolMobilePlanDrawer({
  open,
  onClose,
  symbol,
  assetType,
  isIndex,
  focusPlanToken,
  onBoundStrategyChange,
  onRequestOrder,
  edgeOffsetPx = 44,
}: Props) {
  const t = useTranslations("symbolRail");

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title={t("plan")}
      className="aw aw-mobile-plan-drawer"
      edgeOffsetPx={edgeOffsetPx}
      widthClassName="w-full max-w-[min(100vw,28rem)]"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SymbolOrderRail
          symbol={symbol}
          assetType={assetType}
          isIndex={isIndex}
          onBoundStrategyChange={onBoundStrategyChange}
          focusPlanToken={focusPlanToken}
          onRequestOrder={onRequestOrder}
        />
      </div>
    </SideDrawer>
  );
}
