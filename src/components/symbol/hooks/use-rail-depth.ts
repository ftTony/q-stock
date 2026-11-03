"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
/** Wait for hub WS snapshot before REST seed when push is live. */
const WS_SEED_GRACE_MS = 2_500;
/**
 * Coalesce WS pushes into ≤ ~10 paints/sec.
 * Depth is latest-wins; trades batches merge before one React commit.
 */
const MIN_FLUSH_MS = 100;

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

type PendingWs = {
  book?: DepthBook;
  /** Full replace (hub snapshot / REST-shaped). */
  tradesReplace?: TradeTick[];
  /** Incremental ticks since last flush. */
  tradesAppend?: TradeTick[];
  clearStatus?: boolean;
};

/**
 * Rail depth + time&sales.
 * Primary: quote-ws → Longbridge/Futu broker push (depth + trades channels).
 * Fallback: REST /api/market/depth|trades when WS/push unavailable.
 * WS paints are rAF + 100ms coalesced to protect the main thread.
 */
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
  const gotWsRef = useRef(false);

  const pendingRef = useRef<PendingWs>({});
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFlushAtRef = useRef(0);
  const flushScheduledRef = useRef(false);

  const cancelFlush = useCallback(() => {
    if (flushTimerRef.current != null) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    flushScheduledRef.current = false;
  }, []);

  const flushPending = useCallback(() => {
    flushScheduledRef.current = false;
    flushTimerRef.current = null;
    rafRef.current = null;
    lastFlushAtRef.current = performance.now();

    const pending = pendingRef.current;
    pendingRef.current = {};
    if (
      pending.book === undefined &&
      pending.tradesReplace === undefined &&
      !pending.tradesAppend?.length &&
      !pending.clearStatus
    ) {
      return;
    }

    startTransition(() => {
      if (pending.book !== undefined) setBook(pending.book);
      if (pending.tradesReplace !== undefined) {
        setTrades(pending.tradesReplace.slice(0, MAX_TICKS));
      } else if (pending.tradesAppend?.length) {
        const batch = pending.tradesAppend;
        setTrades((prev) => mergeAppend(prev, batch));
      }
      if (pending.clearStatus) {
        setUnavailable(false);
        setLocked(false);
        setLoading(false);
        setDetail(null);
      }
    });
  }, []);

  const scheduleFlush = useCallback(() => {
    if (flushScheduledRef.current) return;
    flushScheduledRef.current = true;
    const wait = Math.max(
      0,
      MIN_FLUSH_MS - (performance.now() - lastFlushAtRef.current),
    );
    flushTimerRef.current = setTimeout(() => {
      flushTimerRef.current = null;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        flushPending();
      });
    }, wait);
  }, [flushPending]);

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
        gotWsRef.current = true;
        pendingRef.current.book = msg.book;
        pendingRef.current.clearStatus = true;
        scheduleFlush();
        return;
      }
      if (msg.op === "trades") {
        if (msg.symbol.toUpperCase() !== sym || msg.assetType !== assetType) {
          return;
        }
        gotWsRef.current = true;
        if (msg.mode === "append") {
          const prev = pendingRef.current.tradesAppend ?? [];
          pendingRef.current.tradesAppend = [...prev, ...msg.trades];
          pendingRef.current.tradesReplace = undefined;
        } else {
          pendingRef.current.tradesReplace = msg.trades.slice(0, MAX_TICKS);
          pendingRef.current.tradesAppend = undefined;
        }
        pendingRef.current.clearStatus = true;
        scheduleFlush();
      }
    },
    [symbol, assetType, scheduleFlush],
  );

  const { enabled, connected, degraded, push } = useQuoteChannels(
    channels,
    onMessage,
  );

  /** Broker push live → no REST poll; hub snapshot + push carry the book. */
  const pushLive = enabled && connected && push && !degraded;

  useEffect(() => {
    gotWsRef.current = false;
    pendingRef.current = {};
    cancelFlush();
    setBook(null);
    setTrades([]);
    setUnavailable(false);
    setLocked(false);
    setDetail(null);
    setLoading(true);
  }, [mode, symbol, assetType, cancelFlush]);

  useEffect(() => () => cancelFlush(), [cancelFlush]);

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
      // Prefer WS: if push is live and we already got a hub frame, skip REST.
      if (pushLive && gotWsRef.current) {
        setLoading(false);
        return;
      }

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

    if (pushLive) {
      // Give hub snapshot / first push a short window before REST seed.
      timer = setTimeout(() => {
        if (cancelled || gotWsRef.current) {
          if (!cancelled) setLoading(false);
          return;
        }
        void load();
      }, WS_SEED_GRACE_MS);
    } else {
      void load();
    }

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
