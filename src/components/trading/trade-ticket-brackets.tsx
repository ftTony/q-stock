"use client";

import { useTranslations } from "next-intl";

type Props = {
  stopLoss: string;
  onStopLoss: (v: string) => void;
  takeProfit: string;
  onTakeProfit: (v: string) => void;
  onApplyStopPct: (pct: number) => void;
  onApplyTakePct: (pct: number) => void;
  side: "buy" | "sell";
};

const fieldInput =
  "qt-input h-9 w-full px-2.5 text-[13px] tabular-nums leading-none";

/** Optional SL / TP — secondary group under qty, quiet equal columns. */
export function TradeTicketBrackets({
  stopLoss,
  onStopLoss,
  takeProfit,
  onTakeProfit,
  onApplyStopPct,
  onApplyTakePct,
}: Props) {
  const t = useTranslations("trading");

  return (
    <div className="space-y-2 border-t border-[var(--aw-hairline,var(--border))] pt-3">
      <div className="grid grid-cols-2 gap-3">
        <Field
          label={t("stopLoss")}
          value={stopLoss}
          onChange={onStopLoss}
          placeholder={t("optional")}
          actionLabel={t("usePct", { pct: 1 })}
          onAction={() => onApplyStopPct(1)}
        />
        <Field
          label={t("takeProfit")}
          value={takeProfit}
          onChange={onTakeProfit}
          placeholder={t("optional")}
          actionLabel={t("usePct", { pct: 2 })}
          onAction={() => onApplyTakePct(2)}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  actionLabel,
  onAction,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <div className="flex h-4 items-center justify-between gap-2">
        <span className="aw-metric-label !mb-0">{label}</span>
        <button
          type="button"
          className="shrink-0 text-[11px] leading-none text-[var(--aw-primary,var(--brand-text))] hover:underline"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      </div>
      <input
        type="number"
        min="0"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={fieldInput}
      />
    </div>
  );
}
