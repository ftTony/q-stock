"use client";

import { Link } from "@/i18n/routing";
import { SubmitButton } from "@/components/ui/submit-button";
import { fmtMoney } from "@/components/portfolio/format";
import type { PaperOrder, PaperPosition } from "@/components/portfolio/types";

type Props = {
  cash: number;
  positionsValue: number;
  equity: number;
  positions: PaperPosition[];
  pendingOrders: PaperOrder[];
  fills: PaperOrder[];
  tradeMsg: string | null;
  resetting: boolean;
  onReset: () => void;
  onCancelOrder: (id: string) => void;
  labels: {
    accountTitle: string;
    accountDesc: string;
    reset: string;
    loading: string;
    cash: string;
    marketValue: string;
    equity: string;
    positions: string;
    emptyPositions: string;
    symbol: string;
    qty: string;
    avgCost: string;
    price: string;
    pnl: string;
    pendingOrders: string;
    emptyOrders: string;
    recentFills: string;
    emptyFills: string;
    cancel: string;
    side: (key: "buy" | "sell") => string;
    type: (key: "market" | "limit" | "stop") => string;
  };
};

export function PortfolioPaperSection({
  cash,
  positionsValue,
  equity,
  positions,
  pendingOrders,
  fills,
  tradeMsg,
  resetting,
  onReset,
  onCancelOrder,
  labels,
}: Props) {
  return (
    <section className="qt-panel space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{labels.accountTitle}</h2>
          <p className="text-sm text-[var(--muted)]">{labels.accountDesc}</p>
        </div>
        <SubmitButton
          type="button"
          loading={resetting}
          loadingLabel={labels.loading}
          onClick={onReset}
          className="qt-btn-ghost border border-[var(--border)] px-3 py-1.5 text-sm"
        >
          {labels.reset}
        </SubmitButton>
      </div>
      {tradeMsg && (
        <p className="text-xs text-[var(--muted)]">{tradeMsg}</p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-3">
          <div className="text-[11px] text-[var(--muted)]">{labels.cash}</div>
          <div className="mt-1 text-xl font-semibold tabular-nums">
            ${fmtMoney(cash)}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-3">
          <div className="text-[11px] text-[var(--muted)]">{labels.marketValue}</div>
          <div className="mt-1 text-xl font-semibold tabular-nums">
            ${fmtMoney(positionsValue)}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 px-3 py-3 col-span-2 sm:col-span-1">
          <div className="text-[11px] text-[var(--muted)]">{labels.equity}</div>
          <div className="mt-1 text-xl font-semibold tabular-nums text-[var(--brand-text)]">
            ${fmtMoney(equity)}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">{labels.positions}</h3>
        {positions.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{labels.emptyPositions}</p>
        ) : (
          <div className="overflow-x-auto qt-scroll">
            <table className="min-w-[640px] w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[11px] text-[var(--muted)] uppercase">
                  <th className="pb-2 pr-3 font-semibold">{labels.symbol}</th>
                  <th className="pb-2 pr-3 font-semibold">{labels.qty}</th>
                  <th className="pb-2 pr-3 font-semibold">{labels.avgCost}</th>
                  <th className="pb-2 pr-3 font-semibold">{labels.price}</th>
                  <th className="pb-2 pr-3 font-semibold">{labels.marketValue}</th>
                  <th className="pb-2 font-semibold">{labels.pnl}</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[var(--border)]/70 last:border-0"
                  >
                    <td className="py-2.5 pr-3">
                      <Link
                        href={`/symbol/${p.assetType}/${p.symbol}`}
                        className="font-semibold hover:text-[var(--brand-text)]"
                      >
                        {p.symbol}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums">{p.qty}</td>
                    <td className="py-2.5 pr-3 tabular-nums">
                      ${fmtMoney(p.avgCost)}
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums">
                      {p.price != null ? `$${fmtMoney(p.price)}` : "-"}
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums">
                      {p.marketValue != null
                        ? `$${fmtMoney(p.marketValue)}`
                        : "-"}
                    </td>
                    <td
                      className={`py-2.5 tabular-nums font-medium ${
                        (p.unrealizedPnl ?? 0) >= 0
                          ? "text-[var(--up)]"
                          : "text-[var(--down)]"
                      }`}
                    >
                      {p.unrealizedPnl != null
                        ? `${p.unrealizedPnl >= 0 ? "+" : ""}$${fmtMoney(p.unrealizedPnl)}${
                            p.unrealizedPnlPct != null
                              ? ` (${p.unrealizedPnlPct.toFixed(1)}%)`
                              : ""
                          }`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold">{labels.pendingOrders}</h3>
          {pendingOrders.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">{labels.emptyOrders}</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {pendingOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-2 border-b border-[var(--border)]/70 pb-2"
                >
                  <div>
                    <Link
                      href={`/symbol/${o.assetType}/${o.symbol}`}
                      className="font-medium hover:text-[var(--brand-text)]"
                    >
                      {o.symbol}
                    </Link>
                    <span className="text-[var(--muted)]">
                      {" "}
                      · {labels.side(o.side)} · {labels.type(o.type)} · {o.qty}
                      {o.limitPrice != null && ` @ $${fmtMoney(o.limitPrice)}`}
                      {o.stopPrice != null &&
                        ` stop $${fmtMoney(o.stopPrice)}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void onCancelOrder(o.id)}
                    className="text-xs text-[var(--brand-text)] hover:underline"
                  >
                    {labels.cancel}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">{labels.recentFills}</h3>
          {fills.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">{labels.emptyFills}</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {fills.map((o) => (
                <li
                  key={o.id}
                  className="flex justify-between gap-2 border-b border-[var(--border)]/70 pb-2"
                >
                  <span>
                    <Link
                      href={`/symbol/${o.assetType}/${o.symbol}`}
                      className="font-medium hover:text-[var(--brand-text)]"
                    >
                      {o.symbol}
                    </Link>
                    <span className="text-[var(--muted)]">
                      {" "}
                      · {labels.side(o.side)} · {o.qty}
                    </span>
                  </span>
                  <span className="tabular-nums text-[var(--muted)]">
                    {o.filledPrice != null
                      ? `$${fmtMoney(o.filledPrice)}`
                      : "-"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
