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
  focusReviewToken?: number;
  highlightOrderId?: string | null;
  onBoundStrategyChange: (name: string | null, id?: string | null) => void;
  onRequestOrder: () => void;
};

/** H5 full-screen page: 计划 / 复盘 (market now lives under the chart). */
export function SymbolMobilePlanDrawer({
  open,
  onClose,
  symbol,
  assetType,
  isIndex,
  focusPlanToken,
  focusReviewToken = 0,
  highlightOrderId = null,
  onBoundStrategyChange,
  onRequestOrder,
}: Props) {
  const t = useTranslations("symbolRail");

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title={`${t("plan")} / ${t("review")}`}
      className="aw aw-mobile-plan-drawer"
      edgeOffsetPx={0}
      widthClassName="w-full max-w-none"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SymbolOrderRail
          symbol={symbol}
          assetType={assetType}
          isIndex={isIndex}
          onBoundStrategyChange={onBoundStrategyChange}
          focusPlanToken={focusPlanToken}
          focusReviewToken={focusReviewToken}
          highlightOrderId={highlightOrderId}
          onRequestOrder={onRequestOrder}
          planReviewOnly
        />
      </div>
    </SideDrawer>
  );
}
