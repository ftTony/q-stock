import {
  dec,
  getQuoteCtx,
  hasLongbridgeCreds,
} from "@/lib/market/providers/longbridge-client";
import {
  fromLongbridgeSymbol,
  toLbWire,
  type InternalSymbol,
} from "@/lib/market/stream/symbol-map";
import type { Quote } from "@/lib/types";

type QuoteHandler = (quote: Quote) => void;

let started = false;
let pushAvailable = false;
const lbSubscribed = new Set<string>();
const lastByKey = new Map<string, Quote>();
const lbToInternal = new Map<string, InternalSymbol>();

let onQuote: QuoteHandler | null = null;

export function isLongbridgePushAvailable(): boolean {
  return pushAvailable && hasLongbridgeCreds();
}

export function setLongbridgeQuoteHandler(handler: QuoteHandler | null) {
  onQuote = handler;
}

function cacheKey(it: InternalSymbol): string {
  return `${it.assetType}:${it.symbol.toUpperCase()}`;
}

function mergePush(
  internal: InternalSymbol,
  lastDone: number,
  open: number,
  high: number,
  low: number,
  timestamp: number,
  volume: number,
  turnover: number,
): Quote {
  const key = cacheKey(internal);
  const prev = lastByKey.get(key);
  const previousClose =
    prev?.previousClose && prev.previousClose > 0
      ? prev.previousClose
      : prev?.price && prev.price > 0
        ? prev.price
        : lastDone;
  const change = lastDone - previousClose;
  const percentChange =
    previousClose > 0 ? (change / previousClose) * 100 : 0;
  const quote: Quote = {
    symbol: internal.symbol.toUpperCase(),
    assetType: internal.assetType,
    price: lastDone,
    change,
    percentChange,
    high: high > 0 ? high : (prev?.high ?? lastDone),
    low: low > 0 ? low : (prev?.low ?? lastDone),
    open: open > 0 ? open : (prev?.open ?? lastDone),
    previousClose,
    timestamp,
    ...(volume > 0 ? { volume } : prev?.volume ? { volume: prev.volume } : {}),
    ...(turnover > 0
      ? { turnover }
      : prev?.turnover
        ? { turnover: prev.turnover }
        : {}),
  };
  lastByKey.set(key, quote);
  return quote;
}

/** Seed previousClose from REST snapshot so first push can compute change. */
export function seedQuoteCache(quotes: Quote[]) {
  for (const q of quotes) {
    if (!(q.price > 0)) continue;
    lastByKey.set(`${q.assetType}:${q.symbol.toUpperCase()}`, q);
  }
}

export async function initLongbridgePush(): Promise<boolean> {
  if (!hasLongbridgeCreds()) {
    pushAvailable = false;
    return false;
  }
  if (started) return pushAvailable;

  try {
    const ctx = await getQuoteCtx();
    ctx.setOnQuote((err, event) => {
      if (err || !event) {
        if (err) {
          console.warn("[quote-ws] longbridge onQuote error:", err.message);
        }
        return;
      }
      try {
        const lbSym = event.symbol;
        const internal =
          lbToInternal.get(lbSym.toUpperCase()) ??
          fromLongbridgeSymbol(lbSym);
        if (!internal) return;
        const data = event.data;
        const price = dec(data.lastDone);
        if (!(price > 0)) return;
        const quote = mergePush(
          internal,
          price,
          dec(data.open),
          dec(data.high),
          dec(data.low),
          Math.floor((data.timestamp?.getTime?.() ?? Date.now()) / 1000),
          Number(data.volume ?? 0),
          dec(data.turnover),
        );
        onQuote?.(quote);
      } catch (e) {
        console.warn(
          "[quote-ws] push map failed:",
          e instanceof Error ? e.message : e,
        );
      }
    });
    started = true;
    pushAvailable = true;
    console.info("[quote-ws] longbridge push handler ready");
    return true;
  } catch (err) {
    pushAvailable = false;
    console.warn(
      "[quote-ws] longbridge push init failed:",
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}

/** SubType.Quote = 0 — avoid ambient const enum under isolatedModules. */
const SUB_TYPE_QUOTE = 0;

export async function syncLongbridgeSubscriptions(
  wanted: InternalSymbol[],
): Promise<void> {
  if (!pushAvailable || !hasLongbridgeCreds()) return;

  const ctx = await getQuoteCtx();
  const next = new Set<string>();
  for (const it of wanted) {
    if (it.assetType === "crypto") continue;
    const wire = toLbWire(it.assetType, it.symbol);
    next.add(wire);
    lbToInternal.set(wire.toUpperCase(), {
      assetType: it.assetType,
      symbol: it.symbol.toUpperCase(),
    });
  }

  const toAdd = [...next].filter((s) => !lbSubscribed.has(s));
  const toRemove = [...lbSubscribed].filter((s) => !next.has(s));

  if (toAdd.length) {
    try {
      await ctx.subscribe(toAdd, [SUB_TYPE_QUOTE]);
      for (const s of toAdd) lbSubscribed.add(s);
      console.info(`[quote-ws] lb subscribe +${toAdd.length}`);
    } catch (err) {
      console.warn(
        "[quote-ws] lb subscribe failed:",
        err instanceof Error ? err.message : err,
      );
      pushAvailable = false;
    }
  }

  if (toRemove.length) {
    try {
      await ctx.unsubscribe(toRemove, [SUB_TYPE_QUOTE]);
      for (const s of toRemove) lbSubscribed.delete(s);
      console.info(`[quote-ws] lb unsubscribe -${toRemove.length}`);
    } catch (err) {
      console.warn(
        "[quote-ws] lb unsubscribe failed:",
        err instanceof Error ? err.message : err,
      );
    }
  }
}
