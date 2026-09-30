"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { IndexQuote } from "@/components/market/markets-types";
import type { AssetType } from "@/lib/types";

const MARKETS: Array<Exclude<AssetType, "crypto">> = ["stock", "hk", "cn"];

const ROTATE_MS = 5_000;
const REFRESH_MS = 60_000;

type MarketBundle = {
  assetType: Exclude<AssetType, "crypto">;
  indices: IndexQuote[];
};

function IndexChip({ item }: { item: IndexQuote }) {
  const t = useTranslations("market");
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

  return (
    <Link
      href={`/symbol/${item.assetType}/${item.symbol}`}
      className="flex min-w-0 items-baseline gap-1.5 rounded-md px-1.5 py-0.5 transition hover:bg-[var(--sidebar-hover)]"
    >
      <span className="max-w-[4.5rem] truncate text-[11px] text-[var(--muted)] sm:max-w-[6.5rem] sm:text-xs">
        {name}
      </span>
      {item.price != null ? (
        <>
          <span className="text-xs font-semibold tabular-nums sm:text-sm">
            {item.price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span
            className={`text-[11px] font-medium tabular-nums sm:text-xs ${
              up ? "text-[var(--up)]" : "text-[var(--down)]"
            }`}
          >
            {pct != null ? `${up ? "+" : ""}${pct.toFixed(2)}%` : "—"}
          </span>
        </>
      ) : (
        <span className="h-3 w-14 animate-pulse rounded bg-[var(--surface-2)]" />
      )}
    </Link>
  );
}

/** Header ticker: auto-rotate US / HK / CN index triples (no market tabs). */
export function TopbarIndexTicker() {
  const [bundles, setBundles] = useState<MarketBundle[]>(
    MARKETS.map((assetType) => ({ assetType, indices: [] })),
  );
  const [page, setPage] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const results = await Promise.all(
        MARKETS.map(async (assetType) => {
          try {
            const res = await fetch(`/api/indices?assetType=${assetType}`);
            if (!res.ok) return { assetType, indices: [] as IndexQuote[] };
            const data = (await res.json()) as { indices?: IndexQuote[] };
            return { assetType, indices: data.indices ?? [] };
          } catch {
            return { assetType, indices: [] as IndexQuote[] };
          }
        }),
      );
      if (!cancelled) setBundles(results);
    }

    void load();
    const refresh = window.setInterval(() => void load(), REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(refresh);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPage((p) => (p + 1) % MARKETS.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  const current = bundles[page] ?? bundles[0];
  const slots =
    current?.indices.length > 0
      ? current.indices.slice(0, 3)
      : Array.from({ length: 3 }).map((_, i) => ({
          id: `sk-${i}`,
          symbol: "",
          nameKey: "",
          assetType: current?.assetType ?? ("stock" as const),
          price: null,
          change: null,
          percentChange: null,
        }));

  return (
    <div
      key={page}
      className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] animate-[qtFade_0.35s_ease] [&::-webkit-scrollbar]:hidden"
    >
      {slots.map((item) =>
        item.symbol ? (
          <IndexChip key={item.id} item={item} />
        ) : (
          <div
            key={item.id}
            className="flex items-center gap-1.5 px-1.5 py-0.5"
          >
            <span className="h-3 w-10 animate-pulse rounded bg-[var(--surface-2)]" />
            <span className="h-3 w-12 animate-pulse rounded bg-[var(--surface-2)]" />
          </div>
        ),
      )}
    </div>
  );
}
