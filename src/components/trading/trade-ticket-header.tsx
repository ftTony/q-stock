"use client";

import { useTranslations } from "next-intl";
import { ChangePct, PriceText } from "@/components/market/price";
import { displayName } from "@/lib/market-names";
import type { AssetType } from "@/lib/types";

type Props = {
  symbol: string;
  assetType: AssetType;
  name?: string | null;
  lastPrice: number | null;
  percentChange?: number | null;
};

/** Ticket identity — code · name · price · change (P0 IA). */
export function TradeTicketHeader({
  symbol,
  assetType,
  name,
  lastPrice,
  percentChange = null,
}: Props) {
  const t = useTranslations("trading");
  const label = displayName(symbol, assetType, name ?? undefined);
  const showName =
    Boolean(label) && label.toUpperCase() !== symbol.toUpperCase();

  return (
    <div className="min-w-0 border-b border-[var(--aw-hairline,var(--border))] px-4 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[15px] font-semibold tracking-tight tabular-nums">
              {symbol}
            </span>
            {showName ? (
              <span
                className="min-w-0 truncate text-[12px] text-[var(--muted)]"
                title={label}
              >
                {label}
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {lastPrice != null && lastPrice > 0 ? (
              <span className="text-[18px] font-semibold leading-none tabular-nums tracking-tight">
                <PriceText value={lastPrice} change={percentChange ?? undefined} />
              </span>
            ) : (
              <span className="text-[18px] font-semibold tabular-nums text-[var(--muted)]">
                —
              </span>
            )}
            {percentChange != null ? (
              <span className="text-[13px]">
                <ChangePct value={percentChange} />
              </span>
            ) : null}
          </div>
        </div>
        <span className="shrink-0 rounded-sm bg-[var(--aw-parchment,var(--surface-2))] px-1.5 py-0.5 text-[11px] font-medium tracking-[-0.08px] text-[var(--muted)]">
          {t("paperBadge")}
        </span>
      </div>
    </div>
  );
}
