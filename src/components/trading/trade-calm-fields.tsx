"use client";

import { QtSelect } from "@/components/ui/qt-select";
import {
  SymbolEmotionCheck,
  type EmotionTagId,
} from "@/components/symbol/plan/symbol-emotion-check";
import { OrderRiskSummary } from "@/components/trading/order-risk-summary";
import { useTranslations } from "next-intl";

type Props = {
  invalidationPrice: string;
  onInvalidationPrice: (v: string) => void;
  strategies: Array<{ id: string; name: string }>;
  strategyId: string;
  /** Readable name when id not yet in strategies list. */
  strategyName?: string | null;
  onStrategyId: (v: string) => void;
  onOpenPlan?: () => void;
  equity: number | null;
  qty: number;
  entry: number;
  stop: number | null;
  symbol?: string;
  assetType?: string;
  emotionTags: EmotionTagId[];
  onEmotionTags: (tags: EmotionTagId[]) => void;
};

export function TradeCalmFields({
  invalidationPrice,
  onInvalidationPrice,
  strategies,
  strategyId,
  strategyName = null,
  onStrategyId,
  onOpenPlan,
  equity,
  qty,
  entry,
  stop,
  symbol,
  assetType,
  emotionTags,
  onEmotionTags,
}: Props) {
  const t = useTranslations("trading");

  const orphanLabel =
    strategyName?.trim() ||
    (strategyId ? t("strategyBoundFallback") : null);

  const strategyOptions = [
    { value: "__none__", label: t("strategyNone") },
    ...strategies.map((s) => ({ value: s.id, label: s.name })),
    ...(strategyId &&
    !strategies.some((s) => s.id === strategyId) &&
    orphanLabel
      ? [{ value: strategyId, label: orphanLabel }]
      : []),
  ];

  return (
    <>
      <div>
        <label className="aw-metric-label mb-1 block">
          {t("invalidationPrice")}
        </label>
        <input
          type="number"
          min="0"
          step="any"
          value={invalidationPrice}
          onChange={(e) => onInvalidationPrice(e.target.value)}
          placeholder={t("invalidationPlaceholder")}
          className="qt-input h-9 w-full px-3 text-[13px] tabular-nums leading-none"
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <label className="aw-metric-label">{t("strategyTag")}</label>
          {onOpenPlan ? (
            <button
              type="button"
              className="aw-text-link text-[11px] leading-none"
              onClick={onOpenPlan}
            >
              {strategyId ? t("changePlanRule") : t("bindPlanRule")}
            </button>
          ) : null}
        </div>
        {strategies.length > 0 || strategyId ? (
          <QtSelect
            value={strategyId || "__none__"}
            onChange={(v) => onStrategyId(v === "__none__" ? "" : v)}
            triggerClassName="h-9 px-3 text-[13px]"
            options={strategyOptions}
            aria-label={t("strategyTag")}
          />
        ) : (
          <button
            type="button"
            className="flex h-9 w-full items-center border border-dashed border-[var(--aw-hairline,var(--border))] px-3 text-left text-[12px] text-[var(--muted)] hover:border-[var(--brand)]/35 hover:text-[var(--foreground)]"
            onClick={() => onOpenPlan?.()}
          >
            {t("strategyEmptyHint")}
          </button>
        )}
        {!strategyId ? (
          <p className="mt-1 text-[11px] leading-snug text-[var(--muted)]">
            {t("strategySuggest")}
          </p>
        ) : null}
      </div>

      <OrderRiskSummary
        equity={equity}
        qty={qty}
        entry={entry}
        stop={stop}
        symbol={symbol}
        assetType={assetType}
      />

      <SymbolEmotionCheck selected={emotionTags} onChange={onEmotionTags} />
    </>
  );
}
