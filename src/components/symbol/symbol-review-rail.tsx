"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatNumber, formatTime } from "@/lib/format-number";
import type { AssetType } from "@/lib/types";

type OrderRow = {
  id: string;
  side: "buy" | "sell";
  type: string;
  qty: number;
  filledPrice: number | null;
  status: string;
  emotionTags: string[];
  invalidationNote: string | null;
  strategyId: string | null;
  createdAt: string;
  filledAt: string | null;
};

type Filter = "all" | "tagged" | "flags";

type Props = {
  symbol: string;
  assetType: AssetType;
  strategyNameById?: Record<string, string>;
  onOpenPlan?: () => void;
};

function deviationChips(
  order: OrderRow,
  t: (k: string) => string,
): string[] {
  const chips: string[] = [];
  if (!order.strategyId) chips.push(t("reviewNoTag"));
  if (order.emotionTags.includes("oversizing")) chips.push(t("reviewOversizing"));
  if (order.emotionTags.includes("noPlan")) chips.push(t("reviewNoPlan"));
  if (order.emotionTags.includes("fomo")) chips.push(t("reviewFomo"));
  if (order.emotionTags.includes("panic")) chips.push(t("reviewPanic"));
  if (order.emotionTags.includes("revenge")) chips.push(t("reviewRevenge"));
  if (!order.invalidationNote) chips.push(t("reviewNoInvalidation"));
  return chips;
}

export function SymbolReviewRail({
  symbol,
  assetType,
  strategyNameById = {},
  onOpenPlan,
}: Props) {
  const t = useTranslations("symbolRail");
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/trading/orders?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setOrders(data.orders ?? []);
    } finally {
      setLoading(false);
    }
  }, [session?.user, symbol, assetType]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (o.status === "cancelled" || o.status === "rejected") return false;
      if (filter === "tagged") return Boolean(o.strategyId);
      if (filter === "flags") return deviationChips(o, t).length > 0;
      return true;
    });
  }, [orders, filter, t]);

  if (status === "loading") {
    return (
      <div className="p-3 text-[12px] text-[var(--muted)]">{t("reviewLoading")}</div>
    );
  }

  if (!session?.user) {
    return (
      <div className="space-y-2 p-3">
        <p className="aw-caption">
          {t("planLogin")}{" "}
          <Link href="/login" className="aw-text-link">
            {t("planLoginLink")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      <p className="aw-caption">{t("reviewSubtitle")}</p>

      <div
        role="tablist"
        className="flex border-b border-[var(--aw-hairline,var(--border))]"
      >
        {(
          [
            ["all", t("reviewFilterAll")],
            ["tagged", t("reviewFilterTagged")],
            ["flags", t("reviewFilterFlags")],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            data-active={filter === value}
            onClick={() => setFilter(value)}
            className="aw-tab"
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="aw-caption">{t("reviewLoading")}</p>
      ) : null}

      {!loading && filtered.length === 0 ? (
        <div className="space-y-2">
          <p className="aw-caption">{t("reviewEmpty")}</p>
          <button
            type="button"
            onClick={onOpenPlan}
            className="aw-text-link text-[12px]"
          >
            {t("reviewGoPlan")}
          </button>
        </div>
      ) : null}

      <ul className="divide-y divide-[var(--border)]">
        {filtered.map((o) => {
          const chips = deviationChips(o, t);
          const price = o.filledPrice;
          const when = o.filledAt || o.createdAt;
          return (
            <li key={o.id} className="space-y-1.5 py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={`text-[12px] font-medium ${
                    o.side === "buy"
                      ? "text-[var(--up)]"
                      : "text-[var(--down)]"
                  }`}
                >
                  {o.side === "buy" ? t("reviewBuy") : t("reviewSell")} ·{" "}
                  <span className="tabular-nums text-[var(--foreground)]">
                    {formatNumber(o.qty, { maximumFractionDigits: 4 })}
                  </span>
                  {price != null ? (
                    <span className="tabular-nums text-[var(--muted)]">
                      {" "}
                      @ {formatNumber(price, { maximumFractionDigits: 2 })}
                    </span>
                  ) : null}
                </span>
                <span className="aw-caption shrink-0 tabular-nums">
                  {formatTime(new Date(when))}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {o.strategyId ? (
                  <Link
                    href={`/strategies/${o.strategyId}`}
                    className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[12px] text-[var(--brand-text)]"
                  >
                    {strategyNameById[o.strategyId] || t("reviewTagged")}
                  </Link>
                ) : null}
                {chips.map((c) => (
                  <span
                    key={c}
                    className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[12px] text-[var(--muted)]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="space-y-1.5 border-t border-[var(--border)] pt-3">
        <p className="aw-caption leading-snug">
          {t("reviewFootnote")}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {onOpenPlan ? (
            <button
              type="button"
              onClick={onOpenPlan}
              className="aw-text-link text-[12px]"
            >
              {t("reviewRevise")}
            </button>
          ) : null}
          <Link href="/review" className="aw-text-link text-[12px]">
            {t("reviewOpenDesk")}
          </Link>
        </div>
      </div>
    </div>
  );
}
