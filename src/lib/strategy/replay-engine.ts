/**
 * Single-symbol daily rule replay (educational). Long-only.
 * Uses close prices; signal-day close fill + optional slip bps.
 */

export type ReplayBar = {
  t: number; // unix ms
  o: number;
  h: number;
  l: number;
  c: number;
  v?: number;
};

export type ReplayTrade = {
  side: "buy" | "sell";
  barIndex: number;
  time: number;
  price: number;
  qty: number;
};

export type ReplayResult = {
  initialCash: number;
  finalEquity: number;
  totalReturnPct: number;
  maxDrawdownPct: number;
  tradeCount: number;
  winRate: number | null;
  avgWinLossRatio: number | null;
  buyHoldReturnPct: number;
  trades: ReplayTrade[];
  equityCurve: Array<{ t: number; equity: number; buyHold: number }>;
};

export type ReplayAssumptions = {
  fill: "signal_close";
  slipBps: number;
  initialCash: number;
};

type Position = { qty: number; entry: number; entryIndex: number } | null;

function sma(closes: number[], end: number, period: number): number | null {
  if (end + 1 < period) return null;
  let s = 0;
  for (let i = end - period + 1; i <= end; i++) s += closes[i]!;
  return s / period;
}

function crossedUp(
  prevFast: number | null,
  prevSlow: number | null,
  fast: number | null,
  slow: number | null,
): boolean {
  if (prevFast == null || prevSlow == null || fast == null || slow == null)
    return false;
  return prevFast <= prevSlow && fast > slow;
}

function crossedDown(
  prevFast: number | null,
  prevSlow: number | null,
  fast: number | null,
  slow: number | null,
): boolean {
  if (prevFast == null || prevSlow == null || fast == null || slow == null)
    return false;
  return prevFast >= prevSlow && fast < slow;
}

type RulesLite = {
  entry: Array<Record<string, unknown>>;
  exit: Array<Record<string, unknown>>;
  sizing: {
    mode: string;
    qty?: number;
    notional?: number;
    riskPercent?: number;
  };
  constraints?: { cooldownBars?: number };
};

function entrySignal(
  rules: RulesLite,
  closes: number[],
  i: number,
): boolean {
  return rules.entry.every((clause) => {
    const type = clause.type as string;
    if (type === "ma_cross") {
      const fast = Number(clause.fast);
      const slow = Number(clause.slow);
      const f0 = sma(closes, i - 1, fast);
      const s0 = sma(closes, i - 1, slow);
      const f1 = sma(closes, i, fast);
      const s1 = sma(closes, i, slow);
      return clause.direction === "up"
        ? crossedUp(f0, s0, f1, s1)
        : crossedDown(f0, s0, f1, s1);
    }
    if (type === "break_high") {
      const lookback = Number(clause.lookback);
      if (i < lookback) return false;
      let hi = -Infinity;
      for (let j = i - lookback; j < i; j++) hi = Math.max(hi, closes[j]!);
      return closes[i]! > hi;
    }
    if (type === "price_vs_ma") {
      const period = Number(clause.period);
      const ma = sma(closes, i, period);
      if (ma == null) return false;
      return clause.op === "gt" ? closes[i]! > ma : closes[i]! < ma;
    }
    if (type === "hold_bars") {
      // Used as DCA cadence via cooldown; treat every bar as candidate.
      return true;
    }
    return false;
  });
}

function exitSignal(
  rules: RulesLite,
  closes: number[],
  i: number,
  pos: NonNullable<Position>,
): boolean {
  return rules.exit.some((clause) => {
    const type = clause.type as string;
    if (type === "ma_cross") {
      const fast = Number(clause.fast);
      const slow = Number(clause.slow);
      const f0 = sma(closes, i - 1, fast);
      const s0 = sma(closes, i - 1, slow);
      const f1 = sma(closes, i, fast);
      const s1 = sma(closes, i, slow);
      return clause.direction === "down"
        ? crossedDown(f0, s0, f1, s1)
        : crossedUp(f0, s0, f1, s1);
    }
    if (type === "stop_pct") {
      const pct = Number(clause.pct);
      return closes[i]! <= pos.entry * (1 - pct / 100);
    }
    if (type === "take_profit_pct") {
      const pct = Number(clause.pct);
      return closes[i]! >= pos.entry * (1 + pct / 100);
    }
    if (type === "hold_bars") {
      const bars = Number(clause.bars);
      return i - pos.entryIndex >= bars;
    }
    if (type === "price_level") {
      const price = Number(clause.price);
      return clause.op === "lte" ? closes[i]! <= price : closes[i]! >= price;
    }
    return false;
  });
}

function sizeQty(
  rules: RulesLite,
  cash: number,
  price: number,
  entry: number,
): number {
  if (!(price > 0)) return 0;
  const { sizing } = rules;
  if (sizing.mode === "fixedQty" && sizing.qty)
    return Math.max(0, Math.floor(sizing.qty));
  if (sizing.mode === "fixedNotional" && sizing.notional) {
    const n = Math.min(sizing.notional, cash);
    return Math.max(0, Math.floor(n / price));
  }
  if (sizing.mode === "riskPercent" && sizing.riskPercent) {
    // Without stop distance in entry, fall back to 5% stop assumption for sizing.
    const stopDist = entry * 0.05;
    if (!(stopDist > 0)) return 0;
    const budget = cash * (sizing.riskPercent / 100);
    return Math.max(0, Math.floor(budget / stopDist));
  }
  return Math.max(0, Math.floor((cash * 0.1) / price));
}

export function runReplay(
  bars: ReplayBar[],
  rulesRaw: unknown,
  assumptions: ReplayAssumptions,
): ReplayResult {
  const rules = rulesRaw as RulesLite;
  const closes = bars.map((b) => b.c);
  const slip = 1 + assumptions.slipBps / 10000;
  let cash = assumptions.initialCash;
  let pos: Position = null;
  const trades: ReplayTrade[] = [];
  const equityCurve: ReplayResult["equityCurve"] = [];
  let peak = assumptions.initialCash;
  let maxDd = 0;
  let lastEntryBar = -999;
  const cooldown = rules.constraints?.cooldownBars ?? 0;

  const startClose = closes[0] ?? 0;
  const bhShares =
    startClose > 0 ? assumptions.initialCash / (startClose * slip) : 0;

  for (let i = 1; i < bars.length; i++) {
    const px = closes[i]! * slip;
    const mark = closes[i]!;
    if (pos && exitSignal(rules, closes, i, pos)) {
      cash += pos.qty * (mark / slip);
      trades.push({
        side: "sell",
        barIndex: i,
        time: bars[i]!.t,
        price: mark / slip,
        qty: pos.qty,
      });
      pos = null;
    } else if (
      !pos &&
      i - lastEntryBar > cooldown &&
      entrySignal(rules, closes, i)
    ) {
      const qty = sizeQty(rules, cash, px, mark);
      if (qty > 0 && cash >= qty * px) {
        cash -= qty * px;
        pos = { qty, entry: px, entryIndex: i };
        lastEntryBar = i;
        trades.push({
          side: "buy",
          barIndex: i,
          time: bars[i]!.t,
          price: px,
          qty,
        });
      }
    }

    const equity = cash + (pos ? pos.qty * mark : 0);
    const buyHold = bhShares * mark;
    peak = Math.max(peak, equity);
    if (peak > 0) maxDd = Math.max(maxDd, ((peak - equity) / peak) * 100);
    equityCurve.push({ t: bars[i]!.t, equity, buyHold });
  }

  // Flatten open position at end
  if (pos && bars.length) {
    const last = bars[bars.length - 1]!;
    cash += pos.qty * last.c;
    trades.push({
      side: "sell",
      barIndex: bars.length - 1,
      time: last.t,
      price: last.c,
      qty: pos.qty,
    });
    pos = null;
  }

  const finalEquity = cash;
  const totalReturnPct =
    ((finalEquity - assumptions.initialCash) / assumptions.initialCash) * 100;
  const endBh = equityCurve.length
    ? equityCurve[equityCurve.length - 1]!.buyHold
    : assumptions.initialCash;
  const buyHoldReturnPct =
    ((endBh - assumptions.initialCash) / assumptions.initialCash) * 100;

  // Pair buys/sells for win rate
  const rounds: number[] = [];
  let openPx: number | null = null;
  for (const tr of trades) {
    if (tr.side === "buy") openPx = tr.price;
    else if (openPx != null) {
      rounds.push((tr.price - openPx) / openPx);
      openPx = null;
    }
  }
  const wins = rounds.filter((r) => r > 0);
  const losses = rounds.filter((r) => r <= 0);
  const winRate = rounds.length ? (wins.length / rounds.length) * 100 : null;
  const avgWin = wins.length
    ? wins.reduce((a, b) => a + b, 0) / wins.length
    : 0;
  const avgLoss = losses.length
    ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length)
    : 0;
  const avgWinLossRatio =
    avgLoss > 0 ? avgWin / avgLoss : wins.length ? null : null;

  return {
    initialCash: assumptions.initialCash,
    finalEquity,
    totalReturnPct,
    maxDrawdownPct: maxDd,
    tradeCount: rounds.length,
    winRate,
    avgWinLossRatio,
    buyHoldReturnPct,
    trades,
    equityCurve,
  };
}
