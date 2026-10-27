"use client";

import { Link } from "@/i18n/routing";
import { SubmitButton } from "@/components/ui/submit-button";
import { fmtMoney } from "@/components/portfolio/format";
import type { PaperOrder, PaperPosition } from "@/components/portfolio/types";
import { useSettingsModalOptional } from "@/components/settings/settings-modal-context";

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
    riskSettings: string;
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
  const settingsModal = useSettingsModalOptional();
  const actionBtn =
    "qt-btn qt-btn-ghost inline-flex h-8 items-center justify-center px-3 text-[12px] font-medium leading-none";

  return (
    <section className="qt-panel space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-tight sm:text-base">
            {labels.accountTitle}
          </h2>
          <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--muted)] sm:text-[13px]">
            {labels.accountDesc}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {settingsModal ? (
            <button
              type="button"
              className={actionBtn}
              onClick={() => settingsModal.openSettings()}
            >
              {labels.riskSettings}
            </button>
          ) : (
            <Link href="/settings" className={actionBtn}>
              {labels.riskSettings}
            </Link>
          )}
          <SubmitButton
            type="button"
            loading={resetting}
            loadingLabel={labels.loading}
            onClick={onReset}
            className={actionBtn}
          >
            {labels.reset}
          </SubmitButton>
        </div>
      </div>
      {tradeMsg && (
        <p className="text-xs text-[var(--muted)]">{tradeMsg}</p>
      )}
      <div className="grid grid-cols-2 divide-y divide-[var(--border)] border-y border-[var(--border)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="min-w-0 px-3 py-3">
          <div className="text-[11px] text-[var(--muted)]">{labels.cash}</div>
          <div className="mt-1 text-lg font-semibold tabular-nums sm:text-xl">
            ${fmtMoney(cash)}
          </div>
        </div>
        <div className="min-w-0 px-3 py-3">
          <div className="text-[11px] text-[var(--muted)]">{labels.marketValue}</div>
          <div className="mt-1 text-lg font-semibold tabular-nums sm:text-xl">
            ${fmtMoney(positionsValue)}
          </div>
        </div>
        <div className="col-span-2 min-w-0 px-3 py-3 sm:col-span-1">
          <div className="text-[11px] text-[var(--muted)]">{labels.equity}</div>
          <div className="mt-1 text-lg font-semibold tabular-nums text-[var(--brand-text)] sm:text-xl">
            ${fmtMoney(equity)}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-4">
        <h3 className="mb-2 text-sm font-semibold tracking-tight">
          {labels.positions}
        </h3>
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

      <div className="grid gap-0 border-t border-[var(--border)] pt-0 lg:grid-cols-2 lg:divide-x lg:divide-[var(--border)]">
        <div className="pt-4 lg:pr-4">
          <h3 className="mb-2 text-sm font-semibold tracking-tight">
            {labels.pendingOrders}
          </h3>
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
                    {o.strategyId ? (
                      <div className="mt-0.5">
                        <Link
                          href={`/strategies/${o.strategyId}`}
                          className="text-[11px] text-[var(--brand-text)] hover:underline"
                        >
                          {o.strategyName || o.strategyId.slice(0, 8)}
                        </Link>
                      </div>
                    ) : null}
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
        <div className="border-t border-[var(--border)] pt-4 lg:border-t-0 lg:pl-4">
          <h3 className="mb-2 text-sm font-semibold tracking-tight">
            {labels.recentFills}
          </h3>
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
                    {o.strategyId ? (
                      <span className="ml-1 text-[11px] text-[var(--brand-text)]">
                        ·{" "}
                        <Link
                          href={`/strategies/${o.strategyId}`}
                          className="hover:underline"
                        >
                          {o.strategyName || o.strategyId.slice(0, 8)}
                        </Link>
                      </span>
                    ) : null}
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
