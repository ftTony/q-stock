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
  onStrategyId: (v: string) => void;
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
  onStrategyId,
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

      {strategies.length > 0 || strategyId ? (
        <div>
          <label className="aw-metric-label mb-1 block">{t("strategyTag")}</label>
          <QtSelect
            value={strategyId || "__none__"}
            onChange={(v) => onStrategyId(v === "__none__" ? "" : v)}
            triggerClassName="h-9 px-3 text-[13px]"
            options={[
              { value: "__none__", label: t("strategyNone") },
              ...strategies.map((s) => ({ value: s.id, label: s.name })),
              ...(strategyId && !strategies.some((s) => s.id === strategyId)
                ? [{ value: strategyId, label: strategyId.slice(0, 8) }]
                : []),
            ]}
          />
        </div>
      ) : null}

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
