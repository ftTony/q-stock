/**
 * Browser-safe quote-ws protocol (no Node / ws / provider imports).
 * Server hub re-exports the same shapes from `./types`.
 */
import type { IndexQuote } from "@/components/market/markets-types";
import type { DepthBook, TradeTick } from "@/lib/market/book-types";
import type { AssetType, Quote } from "@/lib/types";

export type SymbolChannel = {
  type: "symbol";
  assetType: AssetType;
  symbol: string;
};

export type IndicesChannel = {
  type: "indices";
};

/** L2 order book (Longbridge SubType.Depth push). */
export type DepthChannel = {
  type: "depth";
  assetType: AssetType;
  symbol: string;
};

/** Tick trades (Longbridge SubType.Trade batch push). */
export type TradesChannel = {
  type: "trades";
  assetType: AssetType;
  symbol: string;
};

export type StreamChannel =
  | SymbolChannel
  | IndicesChannel
  | DepthChannel
  | TradesChannel;

export type DepthBookWire = DepthBook;
export type TradeTickWire = TradeTick;

export type ClientMessage =
  | { op: "subscribe"; channels: StreamChannel[] }
  | { op: "unsubscribe"; channels: StreamChannel[] }
  | { op: "ping" };

export type ServerMessage =
  | { op: "quote"; quote: Quote }
  | {
      op: "indices";
      assetType: Exclude<AssetType, "crypto">;
      indices: IndexQuote[];
    }
  | {
      op: "snapshot";
      quotes?: Quote[];
      indicesByMarket?: Partial<
        Record<Exclude<AssetType, "crypto">, IndexQuote[]>
      >;
    }
  | {
      op: "depth";
      assetType: AssetType;
      symbol: string;
      book: DepthBookWire;
    }
  | {
      op: "trades";
      assetType: AssetType;
      symbol: string;
      trades: TradeTickWire[];
      /** snapshot = replace; append = batch push (Futu ticker_list). */
      mode: "snapshot" | "append";
    }
  | { op: "pong" }
  | { op: "error"; message: string }
  | { op: "hello"; push: boolean };

export function symbolChannelKey(
  assetType: AssetType,
  symbol: string,
): string {
  return `symbol:${assetType}:${symbol.trim().toUpperCase()}`;
}

export function depthChannelKey(assetType: AssetType, symbol: string): string {
  return `depth:${assetType}:${symbol.trim().toUpperCase()}`;
}

export function tradesChannelKey(
  assetType: AssetType,
  symbol: string,
): string {
  return `trades:${assetType}:${symbol.trim().toUpperCase()}`;
}

export function indicesChannelKey(): string {
  return "indices";
}

export function channelKey(ch: StreamChannel): string {
  if (ch.type === "indices") return indicesChannelKey();
  if (ch.type === "depth") return depthChannelKey(ch.assetType, ch.symbol);
  if (ch.type === "trades") return tradesChannelKey(ch.assetType, ch.symbol);
  return symbolChannelKey(ch.assetType, ch.symbol);
}

export function parseChannelKey(key: string): StreamChannel | null {
  if (key === "indices") return { type: "indices" };
  const m = key.match(/^(symbol|depth|trades):(stock|hk|cn|crypto):(.+)$/);
  if (!m) return null;
  const kind = m[1] as "symbol" | "depth" | "trades";
  return {
    type: kind,
    assetType: m[2] as AssetType,
    symbol: m[3]!,
  };
}
