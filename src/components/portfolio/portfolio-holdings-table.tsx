"use client";

import { Link } from "@/i18n/routing";
import { ChangePct, PriceText } from "@/components/market/price";
import { Sparkline } from "@/components/market/sparkline";
import { SubmitButton } from "@/components/ui/submit-button";
import { displayName } from "@/lib/market-names";
import type { PortfolioRow } from "@/components/portfolio/types";

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
    buy: string;
    sell: string;
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
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <span className="font-medium">{labels.holdings}</span>
        {loading && (
          <span className="text-xs text-[var(--muted)]">{labels.loading}</span>
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
            className="qt-btn-primary px-4 py-2 text-sm"
          >
            {labels.seedPopular}
          </SubmitButton>
        </div>
      ) : (
        <div className="overflow-x-auto qt-scroll">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[11px] tracking-wider text-[var(--muted)] uppercase">
                <th className="px-4 py-3 font-semibold">{labels.symbol}</th>
                <th className="px-4 py-3 font-semibold">{labels.price}</th>
                <th className="px-4 py-3 font-semibold">{labels.change}</th>
                <th className="px-4 py-3 font-semibold">{labels.last24h}</th>
                <th className="px-4 py-3 font-semibold">{labels.actions}</th>
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
                    <td className="px-4 py-3">
                      <Link
                        href={`/symbol/${item.assetType}/${item.symbol}`}
                        className="flex items-center gap-3"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[11px] font-bold text-[var(--brand-text)]">
                          {item.symbol.slice(0, 2)}
                        </span>
                        <span>
                          <span className="block font-semibold">{item.symbol}</span>
                          <span className="block text-xs text-[var(--muted)]">
                            {displayName(item.symbol, item.assetType)}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium tabular-nums">
                      {q ? (
                        <>
                          $
                          <PriceText
                            value={q.price}
                            change={q.percentChange}
                          />
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {q ? (
                        <span className="inline-flex items-center gap-1">
                          <span aria-hidden>{up ? "▲" : "▼"}</span>
                          <ChangePct value={q.percentChange} />
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <Link
                          href={`/symbol/${item.assetType}/${item.symbol}`}
                          className="qt-link-up text-xs font-bold hover:opacity-80"
                        >
                          {labels.buy}
                        </Link>
                        <Link
                          href={`/alerts?symbol=${item.symbol}&assetType=${item.assetType}`}
                          className="qt-link-down text-xs font-bold hover:opacity-80"
                        >
                          {labels.sell}
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
