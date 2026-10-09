import type { WebSocket } from "ws";
import type { IndexQuote } from "@/components/market/markets-types";
import {
  mergeIndexQuotes,
  quoteForIndexDef,
} from "@/lib/market/index-quotes";
import {
  initLongbridgePush,
  isLongbridgePushAvailable,
  seedQuoteCache,
  setLongbridgeQuoteHandler,
  syncLongbridgeSubscriptions,
} from "@/lib/market/stream/longbridge-push";
import {
  fetchQuotesFor,
  indexItems,
  pollIntervalMs,
  quotesToIndexBundles,
} from "@/lib/market/stream/poll-fallback";
import {
  indexDefsForAssetType,
  type InternalSymbol,
} from "@/lib/market/stream/symbol-map";
import {
  channelKey,
  indicesChannelKey,
  parseChannelKey,
  symbolChannelKey,
  type ClientMessage,
  type ServerMessage,
  type StreamChannel,
} from "@/lib/market/stream/types";
import type { Quote } from "@/lib/types";

type ClientState = {
  ws: WebSocket;
  channels: Set<string>;
};

const clients = new Map<WebSocket, ClientState>();
/** channel key → sockets */
const channelSubs = new Map<string, Set<WebSocket>>();

let pollTimer: ReturnType<typeof setInterval> | null = null;
let syncTimer: ReturnType<typeof setTimeout> | null = null;
let started = false;
const lastIndexBundles: Partial<
  Record<"stock" | "hk" | "cn", IndexQuote[]>
> = {};

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState !== ws.OPEN) return;
  try {
    ws.send(JSON.stringify(msg));
  } catch {
    /* ignore */
  }
}

function broadcast(channel: string, msg: ServerMessage) {
  const set = channelSubs.get(channel);
  if (!set?.size) return;
  const raw = JSON.stringify(msg);
  for (const ws of set) {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(raw);
      } catch {
        /* ignore */
      }
    }
  }
}

function activeSymbolItems(): InternalSymbol[] {
  const out = new Map<string, InternalSymbol>();
  for (const key of channelSubs.keys()) {
    const ch = parseChannelKey(key);
    if (ch?.type === "symbol") {
      out.set(`${ch.assetType}:${ch.symbol}`, {
        assetType: ch.assetType,
        symbol: ch.symbol,
      });
    }
  }
  if (channelSubs.has(indicesChannelKey())) {
    for (const it of indexItems()) {
      out.set(`${it.assetType}:${it.symbol.toUpperCase()}`, {
        assetType: it.assetType,
        symbol: it.symbol.toUpperCase(),
      });
    }
  }
  return [...out.values()];
}

function scheduleSyncLb() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void syncLongbridgeSubscriptions(activeSymbolItems());
  }, 200);
}

async function sendSnapshot(ws: WebSocket, channels: StreamChannel[]) {
  const wantSymbols: InternalSymbol[] = [];
  let wantIndices = false;
  for (const ch of channels) {
    if (ch.type === "indices") wantIndices = true;
    else
      wantSymbols.push({
        assetType: ch.assetType,
        symbol: ch.symbol.toUpperCase(),
      });
  }
  if (wantIndices) {
    for (const it of indexItems()) wantSymbols.push(it);
  }
  const quotes = await fetchQuotesFor(wantSymbols);
  seedQuoteCache(quotes);
  const msg: ServerMessage = { op: "snapshot" };
  if (quotes.length) {
    const symSet = new Set(
      channels
        .filter((c): c is Extract<StreamChannel, { type: "symbol" }> =>
          c.type === "symbol",
        )
        .map((c) => `${c.assetType}:${c.symbol.toUpperCase()}`),
    );
    msg.quotes = quotes.filter((q) =>
      symSet.has(`${q.assetType}:${q.symbol.toUpperCase()}`),
    );
  }
  if (wantIndices) {
    const bundles = quotesToIndexBundles(quotes);
    const merged: Partial<Record<"stock" | "hk" | "cn", IndexQuote[]>> = {};
    for (const market of ["stock", "hk", "cn"] as const) {
      const indices = bundles[market];
      if (!indices) continue;
      const next = mergeIndexQuotes(lastIndexBundles[market], indices);
      lastIndexBundles[market] = next;
      merged[market] = next;
    }
    msg.indicesByMarket = merged;
  }
  send(ws, msg);

  // Also fan out live quote messages for convenience
  if (msg.quotes) {
    for (const q of msg.quotes) {
      send(ws, { op: "quote", quote: q });
    }
  }
  if (msg.indicesByMarket) {
    for (const market of ["stock", "hk", "cn"] as const) {
      const indices = msg.indicesByMarket[market];
      if (indices) send(ws, { op: "indices", assetType: market, indices });
    }
  }
}

function addSub(ws: WebSocket, key: string) {
  let set = channelSubs.get(key);
  if (!set) {
    set = new Set();
    channelSubs.set(key, set);
  }
  set.add(ws);
  clients.get(ws)?.channels.add(key);
}

function removeSub(ws: WebSocket, key: string) {
  clients.get(ws)?.channels.delete(key);
  const set = channelSubs.get(key);
  if (!set) return;
  set.delete(ws);
  if (!set.size) channelSubs.delete(key);
}

function handleSubscribe(ws: WebSocket, channels: StreamChannel[]) {
  const normalized: StreamChannel[] = [];
  for (const ch of channels) {
    if (ch.type === "indices") {
      normalized.push({ type: "indices" });
      addSub(ws, indicesChannelKey());
      continue;
    }
    if (!ch.symbol?.trim()) continue;
    const n: StreamChannel = {
      type: "symbol",
      assetType: ch.assetType,
      symbol: ch.symbol.trim().toUpperCase(),
    };
    normalized.push(n);
    addSub(ws, channelKey(n));
  }
  scheduleSyncLb();
  void sendSnapshot(ws, normalized);
}

function handleUnsubscribe(ws: WebSocket, channels: StreamChannel[]) {
  for (const ch of channels) {
    removeSub(ws, channelKey(ch));
  }
  scheduleSyncLb();
}

function emitQuote(quote: Quote) {
  const key = symbolChannelKey(quote.assetType, quote.symbol);
  broadcast(key, { op: "quote", quote });

  if (!channelSubs.has(indicesChannelKey())) return;
  const market = quote.assetType;
  if (market !== "stock" && market !== "hk" && market !== "cn") return;
  const defs = indexDefsForAssetType(market);
  const def = defs.find((d) => quoteForIndexDef(d, [quote]));
  if (!def || !(quote.price > 0)) return;
  const prev =
    lastIndexBundles[market] ??
    defs.map((d) => ({
      id: d.id,
      symbol: d.symbol,
      nameKey: d.nameKey,
      assetType: d.assetType,
      price: null as number | null,
      change: null as number | null,
      percentChange: null as number | null,
    }));
  const indices = prev.map((row) =>
    row.id === def.id
      ? {
          ...row,
          price: quote.price,
          change: quote.change,
          percentChange: quote.percentChange,
          open: quote.open,
          high: quote.high,
          low: quote.low,
          previousClose: quote.previousClose,
        }
      : row,
  );
  lastIndexBundles[market] = indices;
  broadcast(indicesChannelKey(), { op: "indices", assetType: market, indices });
}

async function pollTick() {
  const items = activeSymbolItems();
  if (!items.length) return;

  // When longbridge push is live, still poll occasionally for indices/prevClose
  // but throttle: if push available, poll at 2x interval by skipping... keep simple: always poll
  // at QUOTE_POLL_MS — when push works, prices update faster; poll keeps indices coherent.
  const quotes = await fetchQuotesFor(items);
  if (!quotes.length) return;
  seedQuoteCache(quotes);

  for (const q of quotes) {
    const key = symbolChannelKey(q.assetType, q.symbol);
    if (channelSubs.has(key)) {
      broadcast(key, { op: "quote", quote: q });
    }
  }

  if (channelSubs.has(indicesChannelKey())) {
    const bundles = quotesToIndexBundles(quotes);
    for (const market of ["stock", "hk", "cn"] as const) {
      const indices = bundles[market];
      if (!indices) continue;
      const merged = mergeIndexQuotes(lastIndexBundles[market], indices);
      lastIndexBundles[market] = merged;
      broadcast(indicesChannelKey(), {
        op: "indices",
        assetType: market,
        indices: merged,
      });
    }
  }
}

export async function startQuoteHub(): Promise<void> {
  if (started) return;
  started = true;
  await initLongbridgePush();
  setLongbridgeQuoteHandler((quote) => emitQuote(quote));
  pollTimer = setInterval(() => void pollTick(), pollIntervalMs());
  console.info(
    `[quote-ws] hub started push=${isLongbridgePushAvailable()} pollMs=${pollIntervalMs()}`,
  );
}

export function attachClient(ws: WebSocket) {
  clients.set(ws, { ws, channels: new Set() });
  send(ws, { op: "hello", push: isLongbridgePushAvailable() });

  ws.on("message", (data) => {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(String(data)) as ClientMessage;
    } catch {
      send(ws, { op: "error", message: "invalid json" });
      return;
    }
    if (msg.op === "ping") {
      send(ws, { op: "pong" });
      return;
    }
    if (msg.op === "subscribe" && Array.isArray(msg.channels)) {
      handleSubscribe(ws, msg.channels);
      return;
    }
    if (msg.op === "unsubscribe" && Array.isArray(msg.channels)) {
      handleUnsubscribe(ws, msg.channels);
      return;
    }
    send(ws, { op: "error", message: "unknown op" });
  });

  ws.on("close", () => {
    const st = clients.get(ws);
    if (st) {
      for (const key of st.channels) removeSub(ws, key);
      clients.delete(ws);
      scheduleSyncLb();
    }
  });
}
