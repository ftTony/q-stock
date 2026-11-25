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
  /** Inline in the industry title row (no own border/padding). */
  variant?: "bar" | "inline";
};

export function AnalysisCompareBasket({
  basket,
  onRemove,
  onClear,
  onOpenCompare,
  variant = "bar",
}: Props) {
  const t = useTranslations("analysis");
  if (basket.length === 0) return null;

  const canCompare = basket.length >= ANALYSIS_BASKET_MIN;
  const inline = variant === "inline";

  return (
    <div
      className={
        inline
          ? "flex min-w-0 flex-wrap items-center justify-end gap-1.5 text-sm"
          : "flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--border)] px-3 py-2 text-sm"
      }
    >
      <span className="shrink-0 text-[13px] font-semibold text-[var(--foreground)]">
        {t("basket")}
      </span>
      <span className="shrink-0 text-[12px] tabular-nums text-[var(--muted)]">
        {t("basketCount", { count: basket.length, max: ANALYSIS_BASKET_MAX })}
      </span>
      <div
        className={`flex min-w-0 flex-wrap gap-1.5 ${inline ? "" : "flex-1"}`}
      >
        {basket.map((item) => (
          <button
            key={`${item.assetType}:${item.symbol}`}
            type="button"
            className="inline-flex h-7 items-center gap-1 rounded-none border border-[var(--border)] bg-[var(--panel)] px-2 text-[12px] font-semibold leading-none hover:border-[var(--brand)]"
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
        <span className="hidden text-[12px] text-[var(--muted)] lg:inline">
          {t("basketHint")}
        </span>
      )}
      <button
        type="button"
        className="qt-btn qt-btn-ghost h-7 shrink-0 px-2.5 text-[12px] font-medium leading-none"
        onClick={onClear}
      >
        {t("clearBasket")}
      </button>
      <button
        type="button"
        className="qt-btn qt-btn-primary h-7 shrink-0 px-2.5 text-[12px] font-medium leading-none disabled:opacity-40"
        disabled={!canCompare}
        onClick={onOpenCompare}
      >
        {t("openCompare")}
      </button>
    </div>
  );
}
