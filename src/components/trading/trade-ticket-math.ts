import type { QtyMode } from "@/components/trading/trade-ticket-qty";

/** Convert ticket qty input (shares / USD / % equity / $ risk) into share count. */
export function resolveShares(opts: {
  mode: QtyMode;
  input: string;
  price: number;
  equity: number;
  stopLoss: string;
}): number {
  const n = Number(opts.input);
  if (!(n > 0) || !(opts.price > 0)) return 0;
  if (opts.mode === "shares") return n;
  if (opts.mode === "usd") return Math.floor((n / opts.price) * 1e4) / 1e4;
  if (opts.mode === "pctEquity") {
    const notional = opts.equity * (n / 100);
    return Math.floor((notional / opts.price) * 1e4) / 1e4;
  }
  const stop = Number(opts.stopLoss);
  const dist = stop > 0 ? Math.abs(opts.price - stop) : opts.price * 0.01;
  if (!(dist > 0)) return 0;
  return Math.floor((n / dist) * 1e4) / 1e4;
}

export function bracketFromPct(
  entry: number,
  pct: number,
  side: "buy" | "sell",
  kind: "stop" | "take",
): string {
  if (!(entry > 0)) return "";
  const buyStop = kind === "stop";
  const down = side === "buy" ? buyStop : !buyStop;
  const p = down ? entry * (1 - pct / 100) : entry * (1 + pct / 100);
  return String(Number(p.toFixed(4)));
}
