"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { TradeSubmitResult } from "@/components/trading/trade-submit-result";

export function TradePanelResultBanner({
  kind,
  orderId,
  onDismiss,
  onOpenSymbolReview,
}: {
  kind: "filled" | "pending" | null;
  orderId: string | null;
  onDismiss: () => void;
  onOpenSymbolReview?: (orderId?: string | null) => void;
}): ReactNode {
  if (!kind) return null;
  return (
    <TradeSubmitResult
      kind={kind}
      onDismiss={onDismiss}
      onViewSymbolReview={
        onOpenSymbolReview ? () => onOpenSymbolReview(orderId) : undefined
      }
    />
  );
}

export function TradePanelDraftBanner({
  visible,
  onClear,
}: {
  visible: boolean;
  onClear: () => void;
}): ReactNode {
  const t = useTranslations("trading");
  if (!visible) return null;
  return (
    <div className="flex items-center justify-between gap-2 border-t border-[var(--aw-hairline,var(--border))] pt-2 text-[12px] text-[var(--brand-text)]">
      <span>{t("aiDraftBanner")}</span>
      <button type="button" className="underline" onClick={onClear}>
        {t("aiDraftUndo")}
      </button>
    </div>
  );
}

export function TradePanelPositionLine({
  qty,
  avgCost,
  fmtMoney,
}: {
  qty: number;
  avgCost: number | null;
  fmtMoney: (n: number) => string;
}): ReactNode {
  const t = useTranslations("trading");
  if (!(qty > 0)) return null;
  return (
    <p className="text-[12px] tabular-nums text-[var(--muted)]">
      {t("position")}: {qty}
      {avgCost != null ? ` · ${t("avgCost")} $${fmtMoney(avgCost)}` : ""}
    </p>
  );
}
