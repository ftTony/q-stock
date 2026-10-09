"use client";

import { useTranslations } from "next-intl";
import {
  ANALYSIS_BASKET_MAX,
  ANALYSIS_BASKET_MIN,
  type AnalysisBasketItem,
} from "@/components/analysis/types";

type Props = {
  basket: AnalysisBasketItem[];
  onRemove: (symbol: string, assetType: AnalysisBasketItem["assetType"]) => void;
  onClear: () => void;
  onOpenCompare: () => void;
};

export function AnalysisCompareBasket({
  basket,
  onRemove,
  onClear,
  onOpenCompare,
}: Props) {
  const t = useTranslations("analysis");
  if (basket.length === 0) return null;

  const canCompare = basket.length >= ANALYSIS_BASKET_MIN;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] bg-[var(--brand-soft)]/20 px-3 py-2.5 text-[14px] leading-5">
      <span className="font-semibold text-[var(--brand-text)]">
        {t("basket")}
      </span>
      <span className="tabular-nums text-[var(--muted)]">
        {t("basketCount", { count: basket.length, max: ANALYSIS_BASKET_MAX })}
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
        {basket.map((item) => (
          <button
            key={`${item.assetType}:${item.symbol}`}
            type="button"
            className="inline-flex items-center gap-1 rounded border border-[var(--border)] bg-[var(--panel)] px-2 py-1 text-[14px] font-semibold leading-5 hover:border-[var(--brand)]"
            title={t("removeFromCompare")}
            onClick={() => onRemove(item.symbol, item.assetType)}
          >
            {item.symbol}
            <span className="text-[var(--muted)]" aria-hidden>
              ×
            </span>
          </button>
        ))}
      </div>
      {!canCompare && (
        <span className="text-[var(--muted)]">{t("basketHint")}</span>
      )}
      <button
        type="button"
        className="qt-btn qt-btn-ghost h-9 px-3 !text-[14px] leading-5"
        onClick={onClear}
      >
        {t("clearBasket")}
      </button>
      <button
        type="button"
        className="qt-btn qt-btn-primary h-9 px-3 !text-[14px] leading-5 disabled:opacity-40"
        disabled={!canCompare}
        onClick={onOpenCompare}
      >
        {t("openCompare")}
      </button>
    </div>
  );
}
