import { bsGreeks, type StrikeRow } from "./option-chain-utils";

/** One position line inside the strategy editor. */
export type StrategyLeg = {
  /** Underlying instrument of the leg. */
  kind: "stock" | "call" | "put";
  /** Buy (long) or sell (short). */
  action: "long" | "short";
  /** Quantity in contracts (stock: in 100-share units). */
  qty: number;
  /** Strike price (stock legs ignore). */
  strike: number | null;
  /** Expiry date `YYYY-MM-DD` (stock legs ignore). */
  expiry: string | null;
};

export type StrategyId =
  | "single"
  | "coveredStock"
  | "vertical"
  | "straddle"
  | "strangle"
  | "calendar"
  | "diagonal"
  | "collar"
  | "butterfly";

export const STRATEGY_IDS: StrategyId[] = [
  "single",
  "coveredStock",
  "vertical",
  "straddle",
  "strangle",
  "calendar",
  "diagonal",
  "collar",
  "butterfly",
];

/** Strategies whose second leg lives on a different expiry. */
export const DUAL_EXPIRY_STRATEGIES: StrategyId[] = ["calendar", "diagonal"];

/** i18n key under `optTool.strategies`. */
export function strategyLabelKey(id: StrategyId): string {
  return `strategies.${id}`;
}

/** Small glyph approximation of the Futu strategy icons. */
export function strategyGlyph(id: StrategyId): string {
  switch (id) {
    case "single":
      return "√";
    case "coveredStock":
      return "/";
    case "vertical":
      return "⌐";
    case "straddle":
      return "∨";
    case "strangle":
      return "∪";
    case "calendar":
      return "∧";
    case "diagonal":
      return "⌇";
    case "collar":
      return "∩";
    case "butterfly":
      return "⩙";
  }
}

/** Sorted unique strikes available for picking a leg. */
export function availableStrikes(rows: StrikeRow[]): number[] {
  const set = new Set<number>();
  for (const r of rows) set.add(r.strike);
  return [...set].sort((a, b) => a - b);
}

function nearestStrike(strikes: number[], target: number): number {
  if (!strikes.length) return 0;
  let best = strikes[0]!;
  for (const s of strikes) {
    if (Math.abs(s - target) < Math.abs(best - target)) best = s;
  }
  return best;
}

/**
 * Default legs for a strategy. `spot` anchors ATM strikes; `expiry` is the
 * currently viewed expiry and `expiryFar` the second one for calendar/diagonal.
 */
export function buildLegs(opts: {
  strategy: StrategyId;
  spot: number;
  expiry: string;
  expiryFar: string | null;
  rows: StrikeRow[];
  /** Seed leg coming from a clicked chain row (strike + call/put). */
  seed?: { kind: "call" | "put"; strike: number } | null;
  /** Vertical/straddle direction: long (buy) or short (sell) the structure. */
  long?: boolean;
  /** Vertical spread type. */
  verticalKind?: "call" | "put";
}): StrategyLeg[] {
  const { strategy, spot, expiry, expiryFar, rows, seed } = opts;
  const long = opts.long ?? true;
  const strikes = availableStrikes(rows);
  const atm = nearestStrike(strikes, spot);
  const atmIdx = strikes.indexOf(atm);
  const low = strikes[Math.max(0, atmIdx - 2)] ?? atm;
  const high = strikes[Math.min(strikes.length - 1, atmIdx + 2)] ?? atm;
  const seedKind = seed?.kind ?? "call";
  const seedStrike = seed?.strike ?? atm;
  const mk = (
    kind: StrategyLeg["kind"],
    action: StrategyLeg["action"],
    strike: number | null,
    expiry2: string | null,
    qty = 1,
  ): StrategyLeg => ({ kind, action, qty, strike, expiry: expiry2 });

  switch (strategy) {
    case "single":
      return [mk(seedKind, "long", seedStrike, expiry)];
    case "coveredStock":
      return [mk("stock", "long", null, null), mk("call", "short", atm, expiry)];
    case "vertical": {
      const kind = opts.verticalKind ?? "call";
      // Bull: long the lower strike; bear: long the higher one.
      const [a, b] = long ? [low, high] : [high, low];
      return [mk(kind, "long", a, expiry), mk(kind, "short", b, expiry)];
    }
    case "straddle":
      return [
        mk("call", long ? "long" : "short", atm, expiry),
        mk("put", long ? "long" : "short", atm, expiry),
      ];
    case "strangle":
      return [
        mk("put", long ? "long" : "short", low, expiry),
        mk("call", long ? "long" : "short", high, expiry),
      ];
    case "calendar":
      return [
        mk("call", "short", atm, expiry),
        mk("call", "long", atm, expiryFar ?? expiry),
      ];
    case "diagonal":
      return [
        mk("call", "short", high, expiry),
        mk("call", "long", low, expiryFar ?? expiry),
      ];
    case "collar":
      return [
        mk("stock", "long", null, null),
        mk("put", "long", low, expiry),
        mk("call", "short", high, expiry),
      ];
    case "butterfly": {
      const mid = strikes[Math.max(0, atmIdx)] ?? atm;
      return [
        mk("call", "long", low, expiry),
        mk("call", "short", mid, expiry, 2),
        mk("call", "long", high, expiry),
      ];
    }
  }
}

const CONTRACT = 100;
const FALLBACK_IV_PCT = 30;

/** Calendar days between two `YYYY-MM-DD` strings (to − from). */
export function daysBetweenYmd(fromYmd: string, toYmd: string): number {
  const a = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fromYmd);
  const b = /^(\d{4})-(\d{2})-(\d{2})$/.exec(toYmd);
  if (!a || !b) return 0;
  const from = Date.UTC(Number(a[1]), Number(a[2]) - 1, Number(a[3]));
  const to = Date.UTC(Number(b[1]), Number(b[2]) - 1, Number(b[3]));
  return Math.round((to - from) / 86_400_000);
}

/** Earliest option expiry in the structure — chart horizon for dual-expiry. */
export function earliestOptionExpiry(legs: StrategyLeg[]): string | null {
  let best: string | null = null;
  for (const leg of legs) {
    if (leg.kind === "stock" || !leg.expiry) continue;
    if (!best || leg.expiry < best) best = leg.expiry;
  }
  return best;
}

export type PayoffCtx = {
  /** Evaluation date (near-month expiry for calendar/diagonal). */
  horizonYmd?: string | null;
  /** Used when a surviving leg has no IV quote. */
  fallbackIvPct?: number;
};

/**
 * Mark of one option at underlying `price`.
 * Expired / horizon legs → intrinsic; longer-dated legs → BS with remaining T.
 */
function optionMark(
  leg: PricedLeg,
  price: number,
  ctx: PayoffCtx | undefined,
): number {
  const k = leg.strike ?? 0;
  const intrinsic =
    leg.kind === "call" ? Math.max(price - k, 0) : Math.max(k - price, 0);
  const horizon = ctx?.horizonYmd;
  if (
    !horizon ||
    !leg.expiry ||
    leg.expiry <= horizon ||
    leg.kind === "stock"
  ) {
    return intrinsic;
  }
  const daysLeft = Math.max(daysBetweenYmd(horizon, leg.expiry), 0);
  if (daysLeft <= 0) return intrinsic;
  const iv = leg.iv != null && leg.iv > 0 ? leg.iv : (ctx?.fallbackIvPct ?? FALLBACK_IV_PCT);
  const theo = bsGreeks(
    price,
    k,
    iv,
    daysLeft,
    leg.kind === "call",
    0,
  ).theo;
  return theo != null && theo > 0 ? theo : intrinsic;
}

/** P&L of one option leg at `price`, in account currency. */
function legPayoff(
  leg: PricedLeg,
  price: number,
  ctx?: PayoffCtx,
): number {
  const sign = leg.action === "long" ? 1 : -1;
  const qty = leg.qty * CONTRACT;
  const mark = optionMark(leg, price, ctx);
  return sign * (mark - (leg.premium ?? 0)) * qty;
}

/** Combined strategy P&L at a single underlying price. */
export function strategyPayoffAt(
  legs: PricedLeg[],
  price: number,
  stockEntry: number,
  ctx?: PayoffCtx,
): number | null {
  const priced = legs.filter(
    (l) => l.kind === "stock" || (l.premium != null && l.strike != null),
  );
  if (!priced.length) return null;
  return priced.reduce((s, leg) => {
    if (leg.kind === "stock") {
      const sign = leg.action === "long" ? 1 : -1;
      return s + sign * (price - stockEntry) * leg.qty * CONTRACT;
    }
    return s + legPayoff(leg, price, ctx);
  }, 0);
}

export type ExpiryScenarioRow = {
  key: string;
  /** Underlying price at expiry assumption. */
  price: number;
  pnl: number | null;
};

/**
 * Spot ±1σ / ±2σ expiry levels (log-normal) plus spot — for the scenario table.
 */
export function buildExpiryScenarios(input: {
  spot: number;
  ivPct: number;
  daysToExpiry: number;
  ratePct?: number;
  legs: PricedLeg[];
  /** Near-month horizon for dual-expiry mark-to-model. */
  horizonYmd?: string | null;
}): ExpiryScenarioRow[] {
  const { spot, legs } = input;
  if (!(spot > 0)) return [];
  const sigma = input.ivPct > 2 ? input.ivPct / 100 : input.ivPct;
  const T = Math.max(input.daysToExpiry, 0) / 365;
  const r = (input.ratePct ?? 0) / 100;
  const ctx: PayoffCtx = {
    horizonYmd: input.horizonYmd ?? earliestOptionExpiry(legs),
    fallbackIvPct: input.ivPct > 0 ? input.ivPct : FALLBACK_IV_PCT,
  };
  const levels: { key: string; z: number }[] = [
    { key: "m2", z: -2 },
    { key: "m1", z: -1 },
    { key: "spot", z: 0 },
    { key: "p1", z: 1 },
    { key: "p2", z: 2 },
  ];
  return levels.map(({ key, z }) => {
    let price = spot;
    if (sigma > 0 && T > 0 && z !== 0) {
      price =
        spot *
        Math.exp((r - (sigma * sigma) / 2) * T + z * sigma * Math.sqrt(T));
    }
    return {
      key,
      price,
      pnl: strategyPayoffAt(legs, price, spot, ctx),
    };
  });
}

/** A leg enriched with entry premium + IV (for surviving-leg BS marks). */
export type PricedLeg = StrategyLeg & {
  premium: number | null;
  /** Implied vol (percent or decimal); used when the leg outlives the horizon. */
  iv?: number | null;
};

export type StrategyEval = {
  prices: number[];
  combined: number[];
  perLeg: number[][];
  /** Net premium received (positive) / paid (negative), per contract. */
  netPremium: number;
  maxProfit: number | null; // null = unbounded
  maxLoss: number | null; // null = unbounded
  breakevens: number[];
};

/**
 * Evaluate a strategy over a price grid.
 * Default: all option legs at intrinsic (true expiry).
 * Dual-expiry: pass `horizonYmd` = near month; farther legs marked with BS.
 */
export function evaluateStrategy(
  legs: PricedLeg[],
  spot: number,
  stockEntry = spot,
  ctx?: PayoffCtx,
): StrategyEval {
  const span = Math.max(spot * 0.5, 0.01);
  const lo = Math.max(spot - span, spot * 0.1);
  const hi = spot + span;
  const steps = 240;
  const prices: number[] = [];
  for (let i = 0; i <= steps; i++) {
    prices.push(lo + ((hi - lo) * i) / steps);
  }

  const payoffCtx: PayoffCtx = {
    horizonYmd: ctx?.horizonYmd ?? earliestOptionExpiry(legs),
    fallbackIvPct: ctx?.fallbackIvPct ?? FALLBACK_IV_PCT,
  };

  const priced = legs.filter(
    (l) => l.kind === "stock" || (l.premium != null && l.strike != null),
  );
  const perLeg = priced.map((leg) => {
    if (leg.kind === "stock") {
      const sign = leg.action === "long" ? 1 : -1;
      return prices.map(
        (p) => sign * (p - stockEntry) * leg.qty * CONTRACT,
      );
    }
    return prices.map((p) => legPayoff(leg, p, payoffCtx));
  });
  const combined = prices.map((_, i) =>
    perLeg.reduce((s, arr) => s + (arr[i] ?? 0), 0),
  );

  let netPremium = 0;
  for (const leg of priced) {
    if (leg.kind === "stock" || leg.premium == null) continue;
    const sign = leg.action === "long" ? -1 : 1;
    netPremium += sign * leg.premium * leg.qty * CONTRACT;
  }

  // Max profit/loss over the grid; detect unbounded wings by end slope.
  let maxProfit: number | null = -Infinity;
  let maxLoss: number | null = Infinity;
  for (const v of combined) {
    if (v > maxProfit) maxProfit = v;
    if (v < maxLoss) maxLoss = v;
  }
  const slopeLeft = (combined[1] ?? 0) - (combined[0] ?? 0);
  const slopeRight =
    (combined[combined.length - 1] ?? 0) - (combined[combined.length - 2] ?? 0);
  const unboundedLeft = Math.abs(slopeLeft) > 1e-9;
  const unboundedRight = Math.abs(slopeRight) > 1e-9;
  /**
   * A long stock leg bounds the downside: the underlying cannot go below 0,
   * so instead of "unbounded loss" cap the loss at the price = 0 payoff.
   */
  const payoffAt = (p: number) =>
    priced.reduce((s, leg) => {
      if (leg.kind === "stock") {
        const sign = leg.action === "long" ? 1 : -1;
        return s + sign * (p - stockEntry) * leg.qty * CONTRACT;
      }
      return s + legPayoff(leg, p, payoffCtx);
    }, 0);
  const hasLongStock = priced.some(
    (l) => l.kind === "stock" && l.action === "long",
  );
  if (unboundedLeft && slopeLeft > 0) {
    maxLoss = hasLongStock ? Math.min(maxLoss, payoffAt(0)) : null;
  }
  if (unboundedLeft && slopeLeft < 0) maxProfit = null;
  if (unboundedRight && slopeRight > 0) maxProfit = null;
  if (unboundedRight && slopeRight < 0) maxLoss = null;

  const breakevens: number[] = [];
  for (let i = 1; i < combined.length; i++) {
    const a = combined[i - 1]!;
    const b = combined[i]!;
    if ((a <= 0 && b > 0) || (a >= 0 && b < 0)) {
      const t = Math.abs(b - a) > 1e-12 ? (0 - a) / (b - a) : 0;
      breakevens.push(prices[i - 1]! + t * (prices[i]! - prices[i - 1]!));
      if (breakevens.length >= 4) break;
    }
  }

  return { prices, combined, perLeg, netPremium, maxProfit, maxLoss, breakevens };
}

/**
 * Look up the mid/last premium of one option from a chain snapshot.
 */
export function premiumFromChain(
  rows: StrikeRow[],
  kind: "call" | "put",
  strike: number,
): number | null {
  return quoteFromChain(rows, kind, strike).premium;
}

/** Mid/last premium + IV for one strike side. */
export function quoteFromChain(
  rows: StrikeRow[],
  kind: "call" | "put",
  strike: number,
): { premium: number | null; iv: number | null } {
  const row = rows.find((r) => r.strike === strike);
  const o = kind === "call" ? row?.call : row?.put;
  if (!o) return { premium: null, iv: null };
  let premium: number | null = null;
  if (o.bid != null && o.ask != null && o.bid > 0 && o.ask > 0) {
    premium = (o.bid + o.ask) / 2;
  } else if (o.last > 0) {
    premium = o.last;
  }
  return { premium, iv: o.iv != null && o.iv > 0 ? o.iv : null };
}
