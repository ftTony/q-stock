"use client";

import { useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format-number";

type Order = {
  id: string;
  side: "buy" | "sell";
  type: "market" | "limit" | "stop";
  qty: number;
  limitPrice: number | null;
  stopPrice: number | null;
};

function fmtMoney(n: number): string {
  return formatNumber(n, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function TradeOpenOrders({
  orders,
  busy,
  onCancel,
}: {
  orders: Order[];
  busy: boolean;
  onCancel: (id: string) => void;
}) {
  const t = useTranslations("trading");
  if (orders.length === 0) return null;

  return (
    <div className="border-t border-[var(--aw-hairline,var(--border))] pt-2.5">
      <h3 className="aw-metric-label mb-1.5">{t("openOrders")}</h3>
      <ul className="divide-y divide-[var(--aw-hairline,var(--border))] text-[12px]">
        {orders.map((o) => (
          <li
            key={o.id}
            className="flex items-start justify-between gap-2 py-2 first:pt-0 last:pb-0"
          >
            <div>
              <div className="font-medium tracking-[-0.08px]">
                {t(o.side)} · {t(o.type)} · {o.qty}
              </div>
              <div className="aw-caption mt-0.5 tabular-nums">
                {o.type === "limit" && o.limitPrice != null
                  ? `@ ${fmtMoney(o.limitPrice)}`
                  : o.type === "stop" && o.stopPrice != null
                    ? `stop ${fmtMoney(o.stopPrice)}`
                    : ""}
              </div>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => onCancel(o.id)}
              className="aw-text-link shrink-0 text-[12px] disabled:opacity-50"
            >
              {t("cancel")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
