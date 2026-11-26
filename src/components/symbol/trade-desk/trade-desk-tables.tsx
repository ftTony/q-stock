"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format-number";
import type { PaperOrder, PaperPosition } from "@/components/portfolio/types";
import { EmptyStateBlock } from "@/components/symbol/shared/symbol-empty-art";
import { TradeDeskPendingRow } from "@/components/symbol/trade-desk/trade-desk-pending-row";

function money(n: number) {
  return formatNumber(n, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Fills the right desk pane only (left account column stays put). */
function Empty({
  children,
  action,
}: {
  children: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="relative min-h-0 flex-1">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
        <EmptyStateBlock art="history" label={children} compact>
          {action ? (
            <button
              type="button"
              onClick={action.onClick}
              className="qt-btn qt-btn-primary mt-1 h-8 px-3 text-[12px] font-medium"
            >
              {action.label}
            </button>
          ) : null}
        </EmptyStateBlock>
      </div>
    </div>
  );
}

const th =
  "pb-2 pr-3 text-left text-[11px] font-medium text-[var(--muted)]";
const td = "py-2 pr-3 text-[12px] tabular-nums text-[var(--foreground)]";
/** No default ink — color comes from sideTone (must beat `td` foreground). */
const tdSide = "py-2 pr-3 text-[12px] font-medium tabular-nums";

/** Buy/sell follow user 涨跌色 (--up / --down). */
function sideTone(side: "buy" | "sell") {
  return side === "buy" ? "!text-[var(--up)]" : "!text-[var(--down)]";
}

export function TradeDeskPositions({
  positions,
  onOpenOrder,
}: {
  positions: PaperPosition[];
  onOpenOrder?: () => void;
}) {
  const t = useTranslations("trading");
  if (positions.length === 0) {
    return (
      <Empty
        action={
          onOpenOrder
            ? { label: t("deskOpenTicket"), onClick: onOpenOrder }
            : undefined
        }
      >
        {t("deskEmptyPositions")}
      </Empty>
    );
  }
  return (
    <div className="min-h-0 flex-1 overflow-auto qt-scroll">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-[var(--aw-hairline,var(--border))]">
            <th className={th}>{t("deskColSymbol")}</th>
            <th className={th}>{t("qty")}</th>
            <th className={th}>{t("avgCost")}</th>
            <th className={th}>{t("deskColPrice")}</th>
            <th className={th}>{t("marketValue")}</th>
            <th className={`${th} pr-0`}>{t("pnl")}</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((p) => (
            <tr
              key={p.id}
              className="border-b border-[var(--aw-hairline,var(--border))] last:border-0"
            >
              <td className={`${td} font-medium`}>
                <Link
                  href={`/symbol/${p.assetType}/${p.symbol}`}
                  className="hover:text-[var(--aw-primary,var(--brand-text))]"
                >
                  {p.symbol}
                </Link>
              </td>
              <td className={td}>{p.qty}</td>
              <td className={td}>${money(p.avgCost)}</td>
              <td className={td}>
                {p.price != null ? `$${money(p.price)}` : "—"}
              </td>
              <td className={td}>
                {p.marketValue != null ? `$${money(p.marketValue)}` : "—"}
              </td>
              <td
                className={`${td} pr-0 font-medium ${
                  (p.unrealizedPnl ?? 0) >= 0
                    ? "text-[var(--up)]"
                    : "text-[var(--down)]"
                }`}
              >
                {p.unrealizedPnl != null
                  ? `${p.unrealizedPnl >= 0 ? "+" : ""}$${money(p.unrealizedPnl)}${
                      p.unrealizedPnlPct != null
                        ? ` (${p.unrealizedPnlPct.toFixed(1)}%)`
                        : ""
                    }`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TradeDeskOrders({
  orders,
  busy,
  onCancel,
  onModify,
  emptyLabel,
  showActions,
}: {
  orders: PaperOrder[];
  busy?: boolean;
  onCancel?: (id: string) => void;
  onModify?: (patch: {
    id: string;
    qty: number;
    limitPrice?: number | null;
    stopPrice?: number | null;
  }) => Promise<void>;
  emptyLabel: string;
  /** Pending book: 改单 + 撤单 */
  showActions?: boolean;
}) {
  const t = useTranslations("trading");
  if (orders.length === 0) {
    return <Empty>{emptyLabel}</Empty>;
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto qt-scroll">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="border-b border-[var(--aw-hairline,var(--border))]">
            <th className={th}>{t("deskColSymbol")}</th>
            <th className={th}>{t("side")}</th>
            <th className={th}>{t("type")}</th>
            <th className={th}>{t("qty")}</th>
            <th className={th}>{t("deskColPrice")}</th>
            <th className={th}>{t("status")}</th>
            {showActions ? <th className={`${th} pr-0`} /> : null}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            if (showActions && o.status === "pending") {
              return (
                <TradeDeskPendingRow
                  key={o.id}
                  order={o}
                  busy={busy}
                  onCancel={onCancel}
                  onModify={onModify}
                />
              );
            }
            // Filled → show execution price; pending → show limit/stop trigger.
            const px =
              o.status === "filled" && o.filledPrice != null
                ? `$${money(o.filledPrice)}`
                : o.limitPrice != null
                  ? `$${money(o.limitPrice)}`
                  : o.stopPrice != null
                    ? `stop $${money(o.stopPrice)}`
                    : o.filledPrice != null
                      ? `$${money(o.filledPrice)}`
                      : "—";
            const statusKey =
              o.status === "pending" ||
              o.status === "filled" ||
              o.status === "cancelled" ||
              o.status === "rejected"
                ? (`status_${o.status}` as const)
                : null;
            return (
              <tr
                key={o.id}
                className="border-b border-[var(--aw-hairline,var(--border))] last:border-0"
              >
                <td className={`${td} font-medium`}>
                  <Link
                    href={`/symbol/${o.assetType}/${o.symbol}`}
                    className="hover:text-[var(--aw-primary,var(--brand-text))]"
                  >
                    {o.symbol}
                  </Link>
                </td>
                <td className={`${tdSide} ${sideTone(o.side)}`}>{t(o.side)}</td>
                <td className={td}>{t(o.type)}</td>
                <td className={td}>{o.qty}</td>
                <td className={td}>{px}</td>
                <td className={td}>
                  {statusKey ? t(statusKey) : o.status}
                </td>
                {showActions ? <td className={`${td} pr-0`} /> : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function TradeDeskFills({
  fills,
  onOpenOrder,
}: {
  fills: PaperOrder[];
  onOpenOrder?: () => void;
}) {
  const t = useTranslations("trading");
  if (fills.length === 0) {
    return (
      <Empty
        action={
          onOpenOrder
            ? { label: t("deskOpenTicket"), onClick: onOpenOrder }
            : undefined
        }
      >
        {t("deskEmptyFills")}
      </Empty>
    );
  }
  return (
    <div className="min-h-0 flex-1 overflow-auto qt-scroll">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-[var(--aw-hairline,var(--border))]">
            <th className={th}>{t("deskColSymbol")}</th>
            <th className={th}>{t("side")}</th>
            <th className={th}>{t("qty")}</th>
            <th className={th}>{t("filledPrice")}</th>
            <th className={`${th} pr-0`}>{t("deskColTime")}</th>
          </tr>
        </thead>
        <tbody>
          {fills.map((o) => (
            <tr
              key={o.id}
              className="border-b border-[var(--aw-hairline,var(--border))] last:border-0"
            >
              <td className={`${td} font-medium`}>
                <Link
                  href={`/symbol/${o.assetType}/${o.symbol}`}
                  className="hover:text-[var(--aw-primary,var(--brand-text))]"
                >
                  {o.symbol}
                </Link>
              </td>
              <td className={`${tdSide} ${sideTone(o.side)}`}>{t(o.side)}</td>
              <td className={td}>{o.qty}</td>
              <td className={td}>
                {o.filledPrice != null ? `$${money(o.filledPrice)}` : "—"}
              </td>
              <td className={`${td} pr-0 text-[var(--muted)]`}>
                {o.filledAt
                  ? new Date(o.filledAt).toLocaleString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
