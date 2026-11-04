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
import { LG_MIN, useMinWidth } from "@/hooks/use-min-width";
import type { ServerMessage } from "@/lib/market/stream/protocol";
import type { AssetType } from "@/lib/types";

const MARKETS: Array<Exclude<AssetType, "crypto">> = ["stock", "hk", "cn"];

const ROTATE_MS = 5_000;

function IndexChip({ item }: { item: IndexQuote }) {
  const t = useTranslations("market");
  const pct = item.percentChange;
  const up = pct != null && pct >= 0;

  let fullName = item.symbol;
  if (item.nameKey) {
    try {
      fullName = t(item.nameKey as "indexSpx");
    } catch {
      fullName = item.symbol;
    }
  }

  let shortName = item.symbol;
  if (item.shortNameKey && t.has(item.shortNameKey as "indexSpxShort")) {
    shortName = t(item.shortNameKey as "indexSpxShort");
  } else {
    const cjk = fullName.match(/[\u4e00-\u9fff]/);
    shortName = cjk?.[0] ?? item.symbol;
  }

  return (
    <Link
      href={`/symbol/${item.assetType}/${item.symbol}`}
      className="flex shrink-0 items-center gap-0.5 px-0.5 py-1 transition hover:bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)] sm:gap-1.5 sm:px-1.5"
      title={fullName}
    >
      <span className="text-[12px] leading-none tracking-[-0.08px] text-[var(--muted)] sm:hidden">
        {shortName}
      </span>
      <span className="hidden max-w-[7rem] truncate text-[12px] leading-none tracking-[-0.08px] text-[var(--muted)] sm:inline">
        {fullName}
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
        <span className="h-3.5 w-8 animate-pulse rounded bg-[var(--surface-2)] sm:w-14" />
      )}
    </Link>
  );
}

/** Header ticker: auto-rotate US / HK / CN index triples (WS push + HTTP fallback). */
export function TopbarIndexTicker() {
  const qc = useQueryClient();
  const isDesktop = useMinWidth(LG_MIN);
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
    if (pollFast || !wsPush || wsDegraded) {
      // H5: avoid 3-market × 3s storms while prices warm up.
      return isDesktop ? 3_000 : 8_000;
    }
    const base = quotePollIntervalMs({
      enabled: wsEnabled,
      connected: wsConnected,
      degraded: wsDegraded,
      push: wsPush,
    });
    if (!isDesktop && typeof base === "number") {
      return Math.max(base, 20_000);
    }
    return base;
  }, [pollFast, wsPush, wsDegraded, wsEnabled, wsConnected, isDesktop]);

  // Desktop: keep all three warm for instant rotate. H5: only active page.
  const stockQ = useMarketIndices("stock", {
    enabled: isDesktop || page === 0,
    refetchInterval: interval,
  });
  const hkQ = useMarketIndices("hk", {
    enabled: isDesktop || page === 1,
    refetchInterval: interval,
  });
  const cnQ = useMarketIndices("cn", {
    enabled: isDesktop || page === 2,
    refetchInterval: interval,
  });

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
      className="flex min-w-0 items-center gap-0.5 overflow-hidden animate-[qtFade_0.35s_ease] sm:gap-1"
    >
      {slots.map((item) => (
        <div key={item.id} className="min-w-0 shrink-0">
          <IndexChip item={item} />
        </div>
      ))}
    </div>
  );
}
