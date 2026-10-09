/**
 * Browser-safe quote-ws protocol (no Node / ws / provider imports).
 * Server hub re-exports the same shapes from `./types`.
 */
import type { IndexQuote } from "@/components/market/markets-types";
import type { AssetType, Quote } from "@/lib/types";

export type SymbolChannel = {
  type: "symbol";
  assetType: AssetType;
  symbol: string;
};

export type IndicesChannel = {
  type: "indices";
};

export type StreamChannel = SymbolChannel | IndicesChannel;

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
  | { op: "pong" }
  | { op: "error"; message: string }
  | { op: "hello"; push: boolean };

export function symbolChannelKey(
  assetType: AssetType,
  symbol: string,
): string {
  return `symbol:${assetType}:${symbol.trim().toUpperCase()}`;
}

export function indicesChannelKey(): string {
  return "indices";
}

export function channelKey(ch: StreamChannel): string {
  if (ch.type === "indices") return indicesChannelKey();
  return symbolChannelKey(ch.assetType, ch.symbol);
}

export function parseChannelKey(key: string): StreamChannel | null {
  if (key === "indices") return { type: "indices" };
  const m = key.match(/^symbol:(stock|hk|cn|crypto):(.+)$/);
  if (!m) return null;
  return {
    type: "symbol",
    assetType: m[1] as AssetType,
    symbol: m[2]!,
  };
}
