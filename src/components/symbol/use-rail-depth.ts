"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  quotePollIntervalMs,
  useQuoteChannels,
} from "@/hooks/use-quote-socket";
import type { DepthBook, TradeTick } from "@/lib/market/book-types";
import type {
  ServerMessage,
  StreamChannel,
} from "@/lib/market/stream/protocol";
import type { AssetType } from "@/lib/types";

const REST_FALLBACK_MS = 4_000;
const MAX_TICKS = 80;

function reasonOf(data: { detail?: unknown }): string | null {
  return typeof data.detail === "string" && data.detail.trim()
    ? data.detail.trim()
    : null;
}

function tickKey(t: TradeTick) {
  return `${t.time}-${t.price}-${t.volume}-${t.direction}`;
}

function mergeAppend(prev: TradeTick[], batch: TradeTick[]): TradeTick[] {
  const seen = new Set(prev.map(tickKey));
  const fresh: TradeTick[] = [];
  for (const t of batch) {
    const k = tickKey(t);
    if (seen.has(k)) continue;
    seen.add(k);
    fresh.push(t);
  }
  if (!fresh.length) return prev;
  // Push batches arrive newest-last or newest-first; keep newest first in UI.
  return [...fresh.reverse(), ...prev].slice(0, MAX_TICKS);
}

export function useRailDepth(
  mode: "book" | "ticks" | "split",
  symbol: string,
  assetType: AssetType,
) {
  const [book, setBook] = useState<DepthBook | null>(null);
  const [trades, setTrades] = useState<TradeTick[]>([]);
  const [unavailable, setUnavailable] = useState(false);
  const [locked, setLocked] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const wantBook = mode === "book" || mode === "split";
  const wantTicks = mode === "ticks" || mode === "split";
  const equity = assetType !== "crypto";

  const channels = useMemo((): StreamChannel[] => {
    if (!equity) return [];
    const out: StreamChannel[] = [];
    const sym = symbol.trim().toUpperCase();
    if (wantBook) out.push({ type: "depth", assetType, symbol: sym });
    if (wantTicks) out.push({ type: "trades", assetType, symbol: sym });
    return out;
  }, [equity, wantBook, wantTicks, assetType, symbol]);

  const onMessage = useCallback(
    (msg: ServerMessage) => {
      const sym = symbol.trim().toUpperCase();
      if (msg.op === "depth") {
        if (msg.symbol.toUpperCase() !== sym || msg.assetType !== assetType) {
          return;
        }
        setBook(msg.book);
        setUnavailable(false);
        setLocked(false);
        setLoading(false);
        setDetail(null);
        return;
      }
      if (msg.op === "trades") {
        if (msg.symbol.toUpperCase() !== sym || msg.assetType !== assetType) {
          return;
        }
        setTrades((prev) =>
          msg.mode === "append"
            ? mergeAppend(prev, msg.trades)
            : msg.trades.slice(0, MAX_TICKS),
        );
        setUnavailable(false);
        setLocked(false);
        setLoading(false);
        setDetail(null);
      }
    },
    [symbol, assetType],
  );

  const { enabled, connected, degraded, push } = useQuoteChannels(
    channels,
    onMessage,
  );

  const pushLive = enabled && connected && push && !degraded;

  useEffect(() => {
    setBook(null);
    setTrades([]);
    setUnavailable(false);
    setLocked(false);
    setDetail(null);
    setLoading(true);
  }, [mode, symbol, assetType]);

  useEffect(() => {
    if (!equity) {
      setUnavailable(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let stopPoll = false;

    async function loadBook(): Promise<"ok" | "empty" | "locked"> {
      const res = await fetch(
        `/api/market/depth?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
      );
      const data = await res.json();
      if (data.code === "ADVANCED_QUOTES_REQUIRED" || res.status === 403) {
        setBook(null);
        setDetail(reasonOf(data));
        return "locked";
      }
      if (data.unavailable || (!data.bids?.length && !data.asks?.length)) {
        setBook(null);
        setDetail(reasonOf(data));
        return "empty";
      }
      setBook({ bids: data.bids ?? [], asks: data.asks ?? [] });
      return "ok";
    }

    async function loadTicks(): Promise<"ok" | "empty" | "locked"> {
      const res = await fetch(
        `/api/market/trades?symbol=${encodeURIComponent(symbol)}&assetType=${assetType}`,
      );
      const data = await res.json();
      if (data.code === "ADVANCED_QUOTES_REQUIRED" || res.status === 403) {
        setTrades([]);
        setDetail((prev) => prev ?? reasonOf(data));
        return "locked";
      }
      if (data.unavailable || !data.trades?.length) {
        setTrades([]);
        setDetail((prev) => prev ?? reasonOf(data));
        return "empty";
      }
      setTrades((data.trades as TradeTick[]).slice(0, MAX_TICKS));
      return "ok";
    }

    async function load() {
      try {
        const [bookState, tickState] = await Promise.all([
          wantBook ? loadBook() : Promise.resolve("ok" as const),
          wantTicks ? loadTicks() : Promise.resolve("ok" as const),
        ]);
        if (cancelled) return;
        const isLocked = bookState === "locked" || tickState === "locked";
        if (isLocked) stopPoll = true;
        setLocked(isLocked);
        if (bookState === "ok" && tickState === "ok") setDetail(null);
        const failed =
          (wantBook && bookState !== "ok") ||
          (wantTicks && tickState !== "ok");
        setUnavailable(failed && mode !== "split");
        if (mode === "split") setUnavailable(false);
      } catch {
        if (!cancelled) setUnavailable(true);
      } finally {
        if (!cancelled) setLoading(false);
      }

      // Live Depth/Trade push → stop REST poll (Futu push path).
      if (cancelled || stopPoll || pushLive) return;
      const wait = enabled
        ? quotePollIntervalMs({
            enabled,
            connected,
            degraded,
            push,
          })
        : REST_FALLBACK_MS;
      timer = setTimeout(() => void load(), wait);
    }

    void load();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [
    mode,
    symbol,
    assetType,
    equity,
    wantBook,
    wantTicks,
    pushLive,
    enabled,
    connected,
    degraded,
    push,
  ]);

  return { book, trades, unavailable, locked, detail, loading };
}
