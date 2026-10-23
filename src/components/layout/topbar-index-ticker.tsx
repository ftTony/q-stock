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
    push: wsPush,
  } = useQuoteChannels([{ type: "indices" }], onWsMessage);

  const hasAnyPrice = bundles.some((b) =>
    b.indices.some(
      (i) => i.price != null && Number.isFinite(i.price) && i.price > 0,
    ),
  );

  useEffect(() => {
    void loadHttp();
    // No push / no prices yet → hit REST until quotes appear.
    const ms =
      !hasAnyPrice || !wsPush || wsDegraded
        ? 3_000
        : quotePollIntervalMs({
            enabled: wsEnabled,
            connected: wsConnected,
            degraded: wsDegraded,
            push: wsPush,
          });
    const refresh = window.setInterval(() => void loadHttp(), ms);
    return () => window.clearInterval(refresh);
  }, [
    loadHttp,
    hasAnyPrice,
    wsEnabled,
    wsConnected,
    wsDegraded,
    wsPush,
  ]);

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
