"use client";

import { Link } from "@/i18n/routing";
import { ChangePct, PriceText } from "@/components/market/price";
import { Sparkline } from "@/components/market/sparkline";
import { SubmitButton } from "@/components/ui/submit-button";
import { displayName } from "@/lib/market-names";
import type { PortfolioRow } from "@/components/portfolio/types";

function pricePrefix(assetType: PortfolioRow["assetType"]): string {
  if (assetType === "hk") return "HK$";
  if (assetType === "cn") return "¥";
  if (assetType === "crypto") return "";
  return "$";
}

type Props = {
  rows: PortfolioRow[];
  loading: boolean;
  seeding: boolean;
  onSeedPopular: () => void;
  labels: {
    holdings: string;
    loading: string;
    watchlistEmpty: string;
    seedPopular: string;
    symbol: string;
    price: string;
    change: string;
    last24h: string;
    actions: string;
    view: string;
    alert: string;
  };
};

export function PortfolioHoldingsTable({
  rows,
  loading,
  seeding,
  onSeedPopular,
  labels,
}: Props) {
  return (
    <section className="qt-panel overflow-hidden">
      <div className="flex h-11 items-center justify-between border-b border-[var(--border)] px-4">
        <span className="text-[13px] font-semibold tracking-tight sm:text-sm">
          {labels.holdings}
        </span>
        {loading && (
          <span className="text-[12px] text-[var(--muted)]">{labels.loading}</span>
        )}
      </div>
      {rows.length === 0 ? (
        <div className="space-y-3 p-6 text-center">
          <p className="text-sm text-[var(--muted)]">{labels.watchlistEmpty}</p>
          <SubmitButton
            type="button"
            loading={seeding}
            loadingLabel={labels.loading}
            onClick={onSeedPopular}
            className="qt-btn qt-btn-primary inline-flex h-8 items-center px-3 text-[13px] font-medium leading-none"
          >
            {labels.seedPopular}
          </SubmitButton>
        </div>
      ) : (
        <div className="overflow-x-auto qt-scroll">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[11px] tracking-wider text-[var(--muted)] uppercase">
                <th className="px-4 py-2.5 font-medium">{labels.symbol}</th>
                <th className="px-4 py-2.5 text-right font-medium">
                  {labels.price}
                </th>
                <th className="px-4 py-2.5 text-right font-medium">
                  {labels.change}
                </th>
                <th className="px-4 py-2.5 font-medium">{labels.last24h}</th>
                <th className="px-4 py-2.5 text-right font-medium">
                  {labels.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const q = item.quote;
                const up = (q?.percentChange ?? 0) >= 0;
                return (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--border)]/70 last:border-0 hover:bg-[var(--sidebar-hover)]/60"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/symbol/${item.assetType}/${item.symbol}`}
                        className="min-w-0"
                      >
                        <span className="block truncate text-[13px] font-semibold tracking-wide">
                          {item.symbol}
                        </span>
                        <span className="block truncate text-[11px] text-[var(--muted)]">
                          {displayName(item.symbol, item.assetType, q?.name)}
                        </span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right text-[13px] font-medium tabular-nums">
                      {q ? (
                        <>
                          {pricePrefix(item.assetType)}
                          <PriceText
                            value={q.price}
                            change={q.percentChange}
                          />
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right text-[13px] tabular-nums">
                      {q ? <ChangePct value={q.percentChange} /> : "-"}
                    </td>
                    <td className="px-4 py-2.5">
                      {q ? (
                        <Sparkline
                          open={q.open}
                          high={q.high}
                          low={q.low}
                          close={q.price}
                          up={up}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-0.5">
                        <Link
                          href={`/symbol/${item.assetType}/${item.symbol}`}
                          className="qt-btn qt-btn-ghost inline-flex h-7 items-center px-2.5 text-[12px] font-medium leading-none"
                        >
                          {labels.view}
                        </Link>
                        <Link
                          href={`/alerts?symbol=${item.symbol}&assetType=${item.assetType}`}
                          className="qt-btn qt-btn-ghost inline-flex h-7 items-center px-2.5 text-[12px] font-medium leading-none"
                        >
                          {labels.alert}
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
