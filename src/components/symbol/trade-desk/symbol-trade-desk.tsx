"use client";

import { useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  useCancelOrder,
  useModifyOrder,
  useTradingOrders,
  useTradingPositions,
} from "@/hooks/query/use-trading";
import type { PaperOrder, PaperPosition } from "@/components/portfolio/types";
import { SymbolPaperRiskBar } from "@/components/symbol/plan/symbol-paper-risk-bar";
import {
  TradeDeskFills,
  TradeDeskOrders,
  TradeDeskPositions,
} from "@/components/symbol/trade-desk/trade-desk-tables";
import type { AssetType } from "@/lib/types";

type DeskTab = "positions" | "orders" | "history" | "fills";

type Props = {
  symbol: string;
  assetType: AssetType;
  lastPrice: number | null;
  onOpenOrder?: () => void;
  /**
   * `split` — stack bottom: account left + book right.
   * `column` — side dock: account strip on top + full-width book.
   */
  layout?: "split" | "column";
};

/**
 * Trading desk: account + 持仓/订单/历史/成交.
 * Order ticket stays in the side dock ticket view.
 */
export function SymbolTradeDesk({
  symbol,
  assetType,
  lastPrice,
  onOpenOrder,
  layout = "split",
}: Props) {
  const t = useTranslations("trading");
  const { status } = useSession();
  const signedIn = status === "authenticated";
  const [tab, setTab] = useState<DeskTab>("positions");
  const column = layout === "column";

  const positionsQuery = useTradingPositions({
    quotes: true,
    enabled: signedIn,
  });
  /** One list → derive pending / history / fills (avoids pending+all double fetch). */
  const ordersQuery = useTradingOrders({ enabled: signedIn });
  const cancelOrder = useCancelOrder();
  const modifyOrder = useModifyOrder();
  const ordersBusy = cancelOrder.isPending || modifyOrder.isPending;

  const positions = useMemo(() => {
    return (
      (
        positionsQuery.data as { positions?: PaperPosition[] } | undefined
      )?.positions ?? []
    );
  }, [positionsQuery.data]);

  const { pending, history, fills } = useMemo(() => {
    const all =
      ((ordersQuery.data as { orders?: PaperOrder[] } | undefined)?.orders ??
        []) as PaperOrder[];
    return {
      pending: all.filter((o) => o.status === "pending"),
      history: all.filter((o) => o.status !== "pending"),
      fills: all.filter((o) => o.status === "filled"),
    };
  }, [ordersQuery.data]);

  const tabs = useMemo(
    () =>
      [
        { id: "positions" as const, label: t("deskTabPositions") },
        { id: "orders" as const, label: t("deskTabOrders") },
        { id: "history" as const, label: t("deskTabHistory") },
        { id: "fills" as const, label: t("deskTabFills") },
      ] as const,
    [t],
  );

  const onCancel = useCallback(
    (id: string) => {
      void cancelOrder.mutateAsync(id);
    },
    [cancelOrder],
  );

  const onModify = useCallback(
    async (patch: {
      id: string;
      qty: number;
      limitPrice?: number | null;
      stopPrice?: number | null;
    }) => {
      await modifyOrder.mutateAsync(patch);
    },
    [modifyOrder],
  );

  /** Column dock: one CTA — empty mid button; top link only when book has rows. */
  const bookHasRows =
    (tab === "positions" && positions.length > 0) ||
    (tab === "orders" && pending.length > 0) ||
    (tab === "history" && history.length > 0) ||
    (tab === "fills" && fills.length > 0);
  const showTopOrder = Boolean(onOpenOrder) && (!column || bookHasRows);

  const account = (
    <SymbolPaperRiskBar
      symbol={symbol}
      assetType={assetType}
      lastPrice={lastPrice}
      variant={column ? "strip" : "side"}
    />
  );

  const book = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--aw-hairline,var(--border))] px-3">
        <div
          className="flex min-w-0 gap-5 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label={t("deskTabsLabel")}
        >
          {tabs.map((item) => {
            const on = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setTab(item.id)}
                className={`relative -mb-px h-9 shrink-0 text-[12px] transition-colors ${
                  on
                    ? "font-semibold text-[var(--foreground)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
                {on ? (
                  <span
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--foreground)]"
                    aria-hidden
                  />
                ) : null}
              </button>
            );
          })}
        </div>
        {showTopOrder ? (
          <button
            type="button"
            onClick={onOpenOrder}
            className="shrink-0 text-[12px] font-medium text-[var(--aw-primary,var(--brand-text))] hover:underline"
          >
            {t("deskOpenTicket")}
          </button>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-2 [content-visibility:auto]">
        {tab === "positions" ? (
          <TradeDeskPositions
            positions={positions}
            onOpenOrder={onOpenOrder}
          />
        ) : null}
        {tab === "orders" ? (
          <TradeDeskOrders
            orders={pending}
            busy={ordersBusy}
            onCancel={onCancel}
            onModify={onModify}
            emptyLabel={t("emptyOrders")}
            showActions
          />
        ) : null}
        {tab === "history" ? (
          <TradeDeskOrders
            orders={history}
            emptyLabel={t("deskEmptyHistory")}
          />
        ) : null}
        {tab === "fills" ? (
          <TradeDeskFills fills={fills} onOpenOrder={onOpenOrder} />
        ) : null}
      </div>
    </div>
  );

  if (column) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {account}
        {book}
      </div>
    );
  }

  return (
    <div className="aw-trade-stack-split flex min-h-0 flex-1 overflow-hidden">
      {account}
      <div
        className="aw-trade-stack-divider shrink-0 self-stretch"
        aria-hidden
      />
      {book}
    </div>
  );
}
