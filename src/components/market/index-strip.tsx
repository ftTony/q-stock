"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Sparkline } from "@/components/market/sparkline";
import type { AssetType } from "@/lib/types";
import type { IndexQuote } from "@/components/market/markets-types";

export type { IndexQuote };

export function IndexStrip({
  indices,
  loading,
  t,
}: {
  indices: IndexQuote[];
  loading: boolean;
  t: ReturnType<typeof useTranslations<"market">>;
}) {
  const slots =
    indices.length > 0
      ? indices
      : loading
        ? Array.from({ length: 3 }).map((_, i) => ({
            id: `sk-${i}`,
            symbol: "",
            nameKey: "",
            assetType: "stock" as AssetType,
            price: null,
            change: null,
            percentChange: null,
          }))
        : [];

  if (!slots.length) return null;

  return (
    <section className="sticky top-14 z-30 -mx-4 grid grid-cols-1 gap-3 border-b border-[var(--border)] bg-[var(--background)]/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:grid-cols-3 sm:px-6">
      {slots.map((item) => {
        const pct = item.percentChange;
        const up = pct != null && pct >= 0;
        let name = item.symbol;
        if (item.nameKey) {
          try {
            name = t(item.nameKey as "indexSpx");
          } catch {
            name = item.symbol;
          }
        }

        const body = (
          <>
            <div className="min-w-0 flex-1 basis-[30%]">
              {item.symbol ? (
                <>
                  <div className="truncate text-sm font-semibold">{name}</div>
                  <div className="text-[11px] tracking-wide text-[var(--muted)]">
                    {item.symbol}
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <div className="h-3.5 w-20 animate-pulse rounded bg-[var(--surface-2)]" />
                  <div className="h-2.5 w-10 animate-pulse rounded bg-[var(--surface-2)]" />
                </div>
              )}
            </div>

            <div className="flex flex-1 basis-[40%] items-center justify-center">
              {item.price != null ? (
                <Sparkline
                  open={item.open ?? item.previousClose ?? item.price}
                  high={item.high ?? item.price}
                  low={item.low ?? item.price}
                  close={item.price}
                  up={up}
                />
              ) : (
                <div className="h-7 w-20 animate-pulse rounded bg-[var(--surface-2)]" />
              )}
            </div>

            <div className="min-w-[5.5rem] shrink-0 flex-1 basis-[30%] text-right">
              {item.price != null ? (
                <>
                  <div className="text-sm font-semibold tabular-nums">
                    {item.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div
                    className={`text-xs font-medium tabular-nums ${
                      up ? "text-[var(--up)]" : "text-[var(--down)]"
                    }`}
                  >
                    {pct != null
                      ? `${up ? "▲" : "▼"} ${up ? "+" : ""}${pct.toFixed(2)}%`
                      : "—"}
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <div className="ml-auto h-3.5 w-16 animate-pulse rounded bg-[var(--surface-2)]" />
                  <div className="ml-auto h-2.5 w-12 animate-pulse rounded bg-[var(--surface-2)]" />
                </div>
              )}
            </div>
          </>
        );

        if (!item.symbol) {
          return (
            <div
              key={item.id}
              className="qt-panel flex items-center gap-3 px-4 py-3"
            >
              {body}
            </div>
          );
        }

        return (
          <Link
            key={item.id}
            href={`/symbol/${item.assetType}/${item.symbol}`}
            className="qt-panel flex items-center gap-3 px-4 py-3 transition hover:border-[var(--brand)]/40 hover:bg-[var(--sidebar-hover)]/40"
          >
            {body}
          </Link>
        );
      })}
    </section>
  );
}
