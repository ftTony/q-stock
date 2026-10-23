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
    <div className="border-t border-[var(--border)] pt-3">
      <h3 className="aw-caption-strong mb-2 text-[13px]">
        {t("openOrders")}
      </h3>
      <ul className="space-y-2 text-[13px]">
        {orders.map((o) => (
          <li
            key={o.id}
            className="flex items-start justify-between gap-2 border-b border-[var(--border)]/60 pb-2 last:border-0"
          >
            <div>
              <div className="font-medium">
                {t(o.side)} · {t(o.type)} · {o.qty}
              </div>
              <div className="text-[var(--muted)] tabular-nums">
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
              className="shrink-0 text-[var(--brand-text)] hover:underline disabled:opacity-50"
            >
              {t("cancel")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
