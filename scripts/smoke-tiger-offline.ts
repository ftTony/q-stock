import { mapTigerBrief, mapTigerKlineItems } from "@/lib/market/providers/tiger-quote-map";
import { runWithMarketCreds } from "@/lib/market/creds-context";
import { listEquityAttempts, getActiveProviders } from "@/lib/market/router";
import { tigerProvider } from "@/lib/market/providers/tiger";
import { toTigerSymbol } from "@/lib/market/symbols";

const bars = mapTigerKlineItems([
  {
    time: 1735516800000,
    open: 243,
    high: 245,
    low: 242,
    close: 245.5,
    volume: 1e6,
  },
  {
    time: 1735603200000,
    open: 245.5,
    high: 248,
    low: 244,
    close: 247.9,
    volume: 2e6,
  },
]);
console.log(
  "kline",
  bars.map((b) => ({ t: b.time, c: b.close })),
);

const withHour = mapTigerBrief(
  {
    symbol: "AAPL",
    latestPrice: 245.5,
    preClose: 237.88,
    change: 7.62,
    changeRate: 0.032,
    open: 241,
    high: 246,
    low: 240,
    volume: 1,
    latestTime: Date.now(),
    hour_trading_tag: "Post-Mkt",
    hour_trading_latest_price: 246.1,
    hour_trading_pre_close: 245.5,
    hour_trading_change: 0.6,
    hour_trading_change_rate: 0.0024,
    hour_trading_timestamp: Date.now(),
  },
  "AAPL",
  "stock",
);
console.log("hour", {
  post: withHour?.postMarket?.price,
  active: withHour?.activeSession,
  pct: withHour?.percentChange,
});

console.log("symbols", {
  aapl: toTigerSymbol("AAPL.US", "stock"),
  hk: toTigerSymbol("700", "hk"),
  cn: toTigerSymbol("600519.SH", "cn"),
});

const multi = runWithMarketCreds(
  {
    equityVendor: "tiger",
    userId: "u1",
    tiger: { mode: "bearer", accessToken: "t" },
    longbridge: { mode: "bearer", accessToken: "l" },
    futu: { mode: "bearer", accessToken: "f" },
  },
  () => listEquityAttempts().map((a) => `${a.id}:${a.source}`),
);
console.log("multi-user", multi);

const onlyTiger = runWithMarketCreds(
  {
    equityVendor: "tiger",
    userId: "u1",
    tiger: { mode: "bearer", accessToken: "t" },
  },
  () => listEquityAttempts().map((a) => `${a.id}:${a.source}`),
);
console.log("only-tiger", onlyTiger);

const providers = runWithMarketCreds(
  { tiger: { mode: "bearer", accessToken: "t" } },
  () => getActiveProviders(),
);
console.log(
  "tiger-active",
  providers.find((p) => p.id === "tiger"),
);
console.log("supports", {
  stock: tigerProvider.supports?.("stock"),
  crypto: tigerProvider.supports?.("crypto"),
});
