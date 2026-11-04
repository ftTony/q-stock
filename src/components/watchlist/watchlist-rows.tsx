"use client";

import { Link } from "@/i18n/routing";
import { ChangePct, PriceText } from "@/components/market/price";
import { Sparkline } from "@/components/market/sparkline";
import { SubmitButton } from "@/components/ui/submit-button";
import { WatchlistMobileList } from "@/components/watchlist/watchlist-mobile-list";
import { displayName } from "@/lib/market-names";
import type { AssetType } from "@/lib/types";

export type WatchlistRow = {
  id: string;
  symbol: string;
  assetType: AssetType;
  quote?: {
    price: number;
    percentChange: number;
    open?: number;
    high?: number;
    low?: number;
    name?: string | null;
  } | null;
};

type Labels = {
  name: string;
  symbol: string;
  price: string;
  change: string;
  last24h: string;
  actions: string;
  buy: string;
  remove: string;
  empty: string;
  seedPopular: string;
  loading: string;
};

type Props = {
  rows: WatchlistRow[];
  onRemove: (id: string) => void;
  onSeed: () => void;
  seeding: boolean;
  /** When filter=全部, show market chip under code. */
  showMarketTag?: boolean;
  marketTag?: (assetType: AssetType) => string;
  labels: Labels;
};

/** Mobile terminal list + desktop table. */
export function WatchlistRows({
  rows,
  onRemove,
  onSeed,
  seeding,
  showMarketTag = false,
  marketTag = () => "",
  labels,
}: Props) {
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        <WatchlistMobileList
          rows={rows}
          onSeed={onSeed}
          seeding={seeding}
          showMarketTag={showMarketTag}
          marketTag={marketTag}
          labels={{
            name: labels.name,
            price: labels.price,
            change: labels.change,
            empty: labels.empty,
            seedPopular: labels.seedPopular,
            loading: labels.loading,
          }}
        />
      </div>

      <div className="hidden overflow-x-auto qt-scroll lg:block">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
            <p className="text-[13px] text-[var(--muted)]">{labels.empty}</p>
            <SubmitButton
              type="button"
              loading={seeding}
              loadingLabel={labels.loading}
              onClick={onSeed}
              className="qt-btn-primary h-9 px-4 text-[13px] font-medium"
            >
              {labels.seedPopular}
            </SubmitButton>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--aw-hairline,var(--border))] text-left text-[11px] text-[var(--muted)]">
                <th className="px-4 py-2.5 font-medium">{labels.symbol}</th>
                <th className="px-4 py-2.5 font-medium">{labels.price}</th>
                <th className="px-4 py-2.5 font-medium">{labels.change}</th>
                <th className="px-4 py-2.5 font-medium">{labels.last24h}</th>
                <th className="px-4 py-2.5 font-medium">{labels.actions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const quote = item.quote;
                const up = (quote?.percentChange ?? 0) >= 0;
                return (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--aw-hairline,var(--border))]/70 last:border-0 hover:bg-[var(--sidebar-hover)]/60"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/symbol/${item.assetType}/${item.symbol}`}
                        className="flex items-center gap-2.5"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--aw-hairline,var(--border))] bg-[var(--surface-2)] text-[10px] font-bold text-[var(--brand-text)]">
                          {item.symbol.slice(0, 2)}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold leading-tight">
                            {displayName(
                              item.symbol,
                              item.assetType,
                              quote?.name,
                            )}
                          </span>
                          <span className="block truncate text-[11px] text-[var(--muted)]">
                            {item.symbol}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 font-medium tabular-nums">
                      {quote ? (
                        <PriceText
                          value={quote.price}
                          change={quote.percentChange}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {quote ? <ChangePct value={quote.percentChange} /> : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      {quote ? (
                        <Sparkline
                          open={quote.open ?? quote.price}
                          high={quote.high ?? quote.price}
                          low={quote.low ?? quote.price}
                          close={quote.price}
                          up={up}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/symbol/${item.assetType}/${item.symbol}`}
                          className="text-xs font-medium text-[var(--brand-text)] hover:underline"
                        >
                          {labels.buy}
                        </Link>
                        <button
                          type="button"
                          className="text-xs font-medium text-[var(--muted)] hover:text-[var(--down)]"
                          onClick={() => onRemove(item.id)}
                        >
                          {labels.remove}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
