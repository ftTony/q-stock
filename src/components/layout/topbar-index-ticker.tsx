"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { formatNumber } from "@/lib/format-number";
import type { IndexQuote } from "@/components/market/markets-types";
import {
  mergeIndexQuotes,
  seedIndexQuotes,
} from "@/lib/market/index-quotes";
import {
  quotePollIntervalMs,
  useQuoteChannels,
} from "@/hooks/use-quote-socket";
import type { ServerMessage } from "@/lib/market/stream/protocol";
import type { AssetType } from "@/lib/types";

const MARKETS: Array<Exclude<AssetType, "crypto">> = ["stock", "hk", "cn"];

const ROTATE_MS = 5_000;

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
            {formatNumber(item.price, {
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

/** Header ticker: auto-rotate US / HK / CN index triples (WS push + HTTP fallback). */
export function TopbarIndexTicker() {
  const [bundles, setBundles] = useState<MarketBundle[]>(() =>
    MARKETS.map((assetType) => ({
      assetType,
      indices: seedIndexQuotes(assetType),
    })),
  );
  const [page, setPage] = useState(0);

  const mergeMarket = useCallback(
    (assetType: Exclude<AssetType, "crypto">, indices: IndexQuote[]) => {
      setBundles((prev) =>
        prev.map((b) =>
          b.assetType === assetType
            ? { ...b, indices: mergeIndexQuotes(b.indices, indices) }
            : b,
        ),
      );
    },
    [],
  );

  const loadHttp = useCallback(async () => {
    const results = await Promise.all(
      MARKETS.map(async (assetType) => {
        try {
          const res = await fetch(`/api/indices?assetType=${assetType}`);
          if (!res.ok) return { assetType, indices: null as IndexQuote[] | null };
          const data = (await res.json()) as { indices?: IndexQuote[] };
          return { assetType, indices: data.indices ?? null };
        } catch {
          return { assetType, indices: null as IndexQuote[] | null };
        }
      }),
    );
    setBundles((prev) =>
      prev.map((b) => {
        const hit = results.find((r) => r.assetType === b.assetType);
        if (!hit?.indices?.length) return b;
        return { ...b, indices: mergeIndexQuotes(b.indices, hit.indices) };
      }),
    );
  }, []);

  const onWsMessage = useCallback(
    (msg: ServerMessage) => {
      if (msg.op === "indices") {
        mergeMarket(msg.assetType, msg.indices);
        return;
      }
      if (msg.op === "snapshot" && msg.indicesByMarket) {
        for (const market of MARKETS) {
          const indices = msg.indicesByMarket[market];
          if (indices) mergeMarket(market, indices);
        }
      }
    },
    [mergeMarket],
  );

  const {
    enabled: wsEnabled,
    connected: wsConnected,
    degraded: wsDegraded,
  } = useQuoteChannels([{ type: "indices" }], onWsMessage);

  useEffect(() => {
    void loadHttp();
    const ms = quotePollIntervalMs({
      enabled: wsEnabled,
      connected: wsConnected,
      degraded: wsDegraded,
    });
    const refresh = window.setInterval(() => void loadHttp(), ms);
    return () => window.clearInterval(refresh);
  }, [loadHttp, wsEnabled, wsConnected, wsDegraded]);

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
      className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] animate-[qtFade_0.35s_ease] [&::-webkit-scrollbar]:hidden"
    >
      {slots.map((item) => (
        <IndexChip key={item.id} item={item} />
      ))}
    </div>
  );
}
