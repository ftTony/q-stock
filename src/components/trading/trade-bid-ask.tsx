"use client";

import { useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format-number";

function fmtMoney(n: number): string {
  return formatNumber(n, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function TradeBidAsk({
  bid,
  ask,
  lastPrice,
  onPick,
}: {
  bid: number | null;
  ask: number | null;
  lastPrice: number | null;
  onPick: (price: number) => void;
}) {
  const t = useTranslations("symbol");
  if (bid == null && ask == null && lastPrice == null) return null;

  const bidPx = bid ?? lastPrice;
  const askPx = ask ?? lastPrice;

  return (
    <div className="grid grid-cols-2 gap-x-5 border border-[var(--aw-hairline,var(--border))] px-3 py-2">
      <button
        type="button"
        className="min-w-0 text-left"
        onClick={() => {
          if (bidPx != null) onPick(bidPx);
        }}
      >
        <div className="aw-metric-label">{t("bid")}</div>
        <div className="aw-metric-value mt-1 truncate text-[var(--up)]">
          {bidPx != null ? fmtMoney(bidPx) : "—"}
        </div>
      </button>
      <button
        type="button"
        className="min-w-0 text-left"
        onClick={() => {
          if (askPx != null) onPick(askPx);
        }}
      >
        <div className="aw-metric-label">{t("ask")}</div>
        <div className="aw-metric-value mt-1 truncate text-[var(--down)]">
          {askPx != null ? fmtMoney(askPx) : "—"}
        </div>
      </button>
    </div>
  );
}
