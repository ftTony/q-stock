"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatNumber } from "@/lib/format-number";
import type { IndexQuote } from "@/components/market/markets-types";
import { useMarketIndices } from "@/hooks/query/use-market";
import {
  mergeIndexQuotes,
  seedIndexQuotes,
} from "@/lib/market/index-quotes";
import {
  quotePollIntervalMs,
  useQuoteChannels,
} from "@/hooks/use-quote-socket";
import { queryKeys } from "@/lib/query/keys";
import type { ServerMessage } from "@/lib/market/stream/protocol";
import type { AssetType } from "@/lib/types";

const MARKETS: Array<Exclude<AssetType, "crypto">> = ["stock", "hk", "cn"];

const ROTATE_MS = 5_000;

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
      className="flex shrink-0 items-center gap-1.5 rounded-md px-1.5 py-1 transition hover:bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)] sm:gap-2 sm:px-2"
    >
      <span className="max-w-[4rem] truncate text-[12px] leading-none tracking-[-0.08px] text-[var(--muted)] sm:max-w-[7rem]">
        {name}
      </span>
      {item.price != null ? (
        <>
          <span className="hidden text-[13px] font-semibold leading-none tabular-nums tracking-[-0.12px] text-[var(--foreground)] sm:inline">
            {formatNumber(item.price, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span
            className={`text-[12px] font-medium leading-none tabular-nums ${
              up ? "text-[var(--up)]" : "text-[var(--down)]"
            }`}
          >
            {pct != null ? `${up ? "+" : ""}${pct.toFixed(1)}%` : "—"}
          </span>
        </>
      ) : (
        <span className="h-3.5 w-10 animate-pulse rounded bg-[var(--surface-2)] sm:w-14" />
      )}
    </Link>
  );
}

/** Header ticker: auto-rotate US / HK / CN index triples (WS push + HTTP fallback). */
export function TopbarIndexTicker() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [pollFast, setPollFast] = useState(true);

  const onWsMessage = useCallback(
    (msg: ServerMessage) => {
      if (msg.op === "indices") {
        const key = queryKeys.market.indices(msg.assetType);
        qc.setQueryData(key, (prev: { indices?: IndexQuote[] } | undefined) => {
          const seed = seedIndexQuotes(msg.assetType);
          const base = prev?.indices?.length ? prev.indices : seed;
          return { indices: mergeIndexQuotes(base, msg.indices) };
        });
        return;
      }
      if (msg.op === "snapshot" && msg.indicesByMarket) {
        for (const market of MARKETS) {
          const indices = msg.indicesByMarket[market];
          if (!indices) continue;
          const key = queryKeys.market.indices(market);
          qc.setQueryData(
            key,
            (prev: { indices?: IndexQuote[] } | undefined) => {
              const seed = seedIndexQuotes(market);
              const base = prev?.indices?.length ? prev.indices : seed;
              return { indices: mergeIndexQuotes(base, indices) };
            },
          );
        }
      }
    },
    [qc],
  );

  const {
    enabled: wsEnabled,
    connected: wsConnected,
    degraded: wsDegraded,
    push: wsPush,
  } = useQuoteChannels([{ type: "indices" }], onWsMessage);

  const interval = useMemo(() => {
    if (pollFast || !wsPush || wsDegraded) return 3_000;
    return quotePollIntervalMs({
      enabled: wsEnabled,
      connected: wsConnected,
      degraded: wsDegraded,
      push: wsPush,
    });
  }, [pollFast, wsPush, wsDegraded, wsEnabled, wsConnected]);

  const stockQ = useMarketIndices("stock", { refetchInterval: interval });
  const hkQ = useMarketIndices("hk", { refetchInterval: interval });
  const cnQ = useMarketIndices("cn", { refetchInterval: interval });

  const bundles = useMemo(() => {
    const byMarket: Record<string, IndexQuote[]> = {
      stock: (stockQ.data?.indices as IndexQuote[] | undefined) ?? [],
      hk: (hkQ.data?.indices as IndexQuote[] | undefined) ?? [],
      cn: (cnQ.data?.indices as IndexQuote[] | undefined) ?? [],
    };
    return MARKETS.map((assetType) => {
      const live = byMarket[assetType] ?? [];
      const indices = live.length
        ? mergeIndexQuotes(seedIndexQuotes(assetType), live)
        : seedIndexQuotes(assetType);
      return { assetType, indices };
    });
  }, [stockQ.data, hkQ.data, cnQ.data]);

  useEffect(() => {
    const hasAnyPrice = bundles.some((b) =>
      b.indices.some(
        (i) => i.price != null && Number.isFinite(i.price) && i.price > 0,
      ),
    );
    setPollFast(!hasAnyPrice || !wsPush || wsDegraded);
  }, [bundles, wsPush, wsDegraded]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPage((p) => (p + 1) % MARKETS.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  const current = bundles[page] ?? bundles[0];
  const slots = (current?.indices.length
    ? current.indices
    : seedIndexQuotes(current?.assetType ?? "stock")
  ).slice(0, 3);

  return (
    <div
      key={page}
      className="flex min-w-0 items-center gap-1 overflow-hidden animate-[qtFade_0.35s_ease] sm:gap-1.5"
    >
      {slots.map((item, i) => (
        <div
          key={item.id}
          className={
            i === 0 ? "min-w-0 shrink" : "hidden min-w-0 shrink md:block"
          }
        >
          <IndexChip item={item} />
        </div>
      ))}
    </div>
  );
}
