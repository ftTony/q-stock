"use client";

import { Link } from "@/i18n/routing";
import { ChangePctBadge, PriceText } from "@/components/market/price";
import { SubmitButton } from "@/components/ui/submit-button";
import { displayName } from "@/lib/market-names";
import type { AssetType } from "@/lib/types";
import type { WatchlistRow } from "@/components/watchlist/watchlist-rows";

type Props = {
  rows: WatchlistRow[];
  onSeed: () => void;
  seeding: boolean;
  showMarketTag: boolean;
  marketTag: (assetType: AssetType) => string;
  labels: {
    name: string;
    price: string;
    change: string;
    empty: string;
    seedPopular: string;
    loading: string;
  };
};

/**
 * H5 自选：券商终端密度 — 名称/代码 · 最新价 · 涨跌幅色块。
 * 桌面表格见 WatchlistRows。
 */
export function WatchlistMobileList({
  rows,
  onSeed,
  seeding,
  showMarketTag,
  marketTag,
  labels,
}: Props) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="max-w-[16rem] text-[13px] leading-relaxed text-[var(--muted)]">
          {labels.empty}
        </p>
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
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="sticky top-0 z-10 grid grid-cols-[minmax(0,1fr)_4.75rem_5rem] items-center gap-x-2 border-b border-[var(--aw-hairline,var(--border))] bg-[var(--panel)] px-3 py-1.5 text-[11px] text-[var(--muted)]"
        aria-hidden
      >
        <span>{labels.name}</span>
        <span className="text-right">{labels.price}</span>
        <span className="text-right">{labels.change}</span>
      </div>
      <ul className="divide-y divide-[var(--aw-hairline,var(--border))]">
        {rows.map((item) => {
          const quote = item.quote;
          const name = displayName(item.symbol, item.assetType, quote?.name);
          return (
            <li key={item.id}>
              <Link
                href={`/symbol/${item.assetType}/${item.symbol}`}
                className="grid grid-cols-[minmax(0,1fr)_4.75rem_5rem] items-center gap-x-2 px-3 py-2.5 active:bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-semibold leading-[1.2] tracking-[-0.2px] text-[var(--foreground)]">
                    {name}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[11px] leading-none text-[var(--muted)]">
                    <span className="truncate tabular-nums">{item.symbol}</span>
                    {showMarketTag ? (
                      <span className="shrink-0 border border-[var(--aw-hairline,var(--border))] px-1 py-px text-[10px] leading-none text-[var(--muted)]">
                        {marketTag(item.assetType)}
                      </span>
                    ) : null}
                  </span>
                </span>
                <span className="text-right text-[16px] font-semibold tabular-nums leading-none tracking-[-0.3px]">
                  {quote ? (
                    <PriceText
                      value={quote.price}
                      change={quote.percentChange}
                    />
                  ) : (
                    <span className="text-[var(--muted)]">—</span>
                  )}
                </span>
                <span className="flex justify-end">
                  {quote ? (
                    <ChangePctBadge
                      value={quote.percentChange}
                      className="h-7 min-w-[4.75rem] text-[13px] font-semibold"
                    />
                  ) : (
                    <span className="text-[12px] text-[var(--muted)]">—</span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
