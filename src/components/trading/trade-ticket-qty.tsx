"use client";

import { useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format-number";

export type QtyMode = "shares" | "usd" | "pctEquity" | "risk";

const QUICK = [100, 250, 500, 1000] as const;

type Props = {
  mode: QtyMode;
  onMode: (m: QtyMode) => void;
  value: string;
  onValue: (v: string) => void;
  shares: number;
  estimateNotional: number;
  equityPct: number;
  maxSharesByMargin: number;
  currencyPrefix?: string;
};

/**
 * Qty block: label → mode segment → input → compact quick chips → meta.
 * Mode uses a hairline segment (same language as side), not floating text links.
 */
export function TradeTicketQty({
  mode,
  onMode,
  value,
  onValue,
  shares,
  estimateNotional,
  equityPct,
  maxSharesByMargin,
  currencyPrefix = "US$",
}: Props) {
  const t = useTranslations("trading");
  const modes: { id: QtyMode; label: string }[] = [
    { id: "shares", label: t("qtyModeShares") },
    { id: "usd", label: t("qtyModeUsd") },
    { id: "pctEquity", label: t("qtyModePctEquity") },
    { id: "risk", label: t("qtyModeRisk") },
  ];
  const unitByMode: Record<QtyMode, string> = {
    shares: t("qtyUnitShares"),
    usd: "USD",
    pctEquity: "%",
    risk: "$",
  };

  return (
    <div className="space-y-2">
      <span className="aw-metric-label block">{t("qty")}</span>

      <div
        className="grid grid-cols-4 overflow-hidden border border-[var(--aw-hairline,var(--border))]"
        role="tablist"
        aria-label={t("qty")}
      >
        {modes.map((m, i) => {
          const on = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onMode(m.id)}
              className={`flex h-7 items-center justify-center text-[11px] leading-none transition-colors ${
                i > 0
                  ? "border-l border-[var(--aw-hairline,var(--border))]"
                  : ""
              } ${
                on
                  ? "bg-[var(--surface-2,var(--aw-pearl,#f3f3f1))] font-semibold text-[var(--foreground)]"
                  : "bg-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <input
          type="number"
          min="0"
          step="any"
          required
          value={value}
          onChange={(e) => onValue(e.target.value)}
          className="qt-input h-9 w-full py-0 pl-3 pr-10 text-[15px] font-semibold tabular-nums leading-none tracking-[-0.02em]"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[11px] tabular-nums text-[var(--muted)]">
          {unitByMode[mode]}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {QUICK.map((n) => (
          <button
            key={n}
            type="button"
            className="inline-flex h-7 min-w-[3.25rem] flex-1 items-center justify-center border border-[var(--aw-hairline,var(--border))] bg-transparent px-2 text-[11px] tabular-nums text-[var(--muted)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
            onClick={() => {
              if (mode === "pctEquity") onValue(String(Math.min(100, n / 10)));
              else onValue(String(n));
            }}
          >
            {formatNumber(n)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-[11px] leading-snug tabular-nums text-[var(--muted)]">
        <span>
          {t("orderValueShort", {
            value: `${currencyPrefix}${formatNumber(estimateNotional, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
          })}
          <span className="mx-1 opacity-40">·</span>
          {formatNumber(equityPct, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
          %
        </span>
        <span>
          {formatNumber(shares, { maximumFractionDigits: 2 })}
          <span className="mx-1 opacity-40">·</span>
          {t("maxSharesShort", {
            n: Math.max(0, Math.floor(maxSharesByMargin)),
          })}
        </span>
      </div>
    </div>
  );
}
