/**
 * Option calculator pricing: Black-Scholes for European options and a CRR
 * binomial tree for American options (early exercise), with full greeks
 * including Rho — used by the in-drawer 期权计算器.
 */

export type CalcModel = "american" | "european";

export type CalcResult = {
  theo: number | null;
  dist: number | null; // theo - spot (mark vs current price)
  delta: number | null;
  gamma: number | null;
  vega: number | null;
  theta: number | null; // per calendar day
  rho: number | null;
};

function erf(x: number): number {
  const s = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t -
      0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-ax * ax);
  return s * y;
}

function normCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export type CalcInput = {
  spot: number;
  strike: number;
  /** Implied volatility in percent (e.g. 42.5) or decimal; normalized inside. */
  ivPct: number;
  /** Calendar days to the valuation/expiry date (>= 0). */
  days: number;
  /** Risk-free rate in percent (e.g. 4.2158). */
  ratePct: number;
  isCall: boolean;
  model: CalcModel;
};

const EMPTY: CalcResult = {
  theo: null,
  dist: null,
  delta: null,
  gamma: null,
  vega: null,
  theta: null,
  rho: null,
};

function bs(spot: number, k: number, sigma: number, T: number, r: number, isCall: boolean): CalcResult {
  const sqT = Math.sqrt(T);
  const d1 = (Math.log(spot / k) + (r + (sigma * sigma) / 2) * T) / (sigma * sqT);
  const d2 = d1 - sigma * sqT;
  const disc = Math.exp(-r * T);
  const nd1 = normPdf(d1);
  const theo = isCall
    ? spot * normCdf(d1) - k * disc * normCdf(d2)
    : k * disc * normCdf(-d2) - spot * normCdf(-d1);
  const delta = isCall ? normCdf(d1) : normCdf(d1) - 1;
  const gamma = nd1 / (spot * sigma * sqT);
  const vega = (spot * nd1 * sqT) / 100; // per 1 vol point
  const common = (-spot * nd1 * sigma) / (2 * sqT);
  const theta = isCall
    ? (common - r * k * disc * normCdf(d2)) / 365
    : (common + r * k * disc * normCdf(-d2)) / 365;
  const rho = isCall
    ? (k * T * disc * normCdf(d2)) / 100
    : (-k * T * disc * normCdf(-d2)) / 100;
  return { theo, dist: theo - spot, delta, gamma, vega, theta, rho };
}

/** CRR binomial pricer for American options (early exercise). */
function crrPrice(
  spot: number,
  k: number,
  sigma: number,
  T: number,
  r: number,
  isCall: boolean,
  steps = 160,
): number {
  const dt = T / steps;
  const u = Math.exp(sigma * Math.sqrt(dt));
  const d = 1 / u;
  const disc = Math.exp(-r * dt);
  const p = (Math.exp(r * dt) - d) / (u - d);
  if (p <= 0 || p >= 1) {
    // Degenerate parameters — fall back to the European closed form.
    const g = bs(spot, k, sigma, T, r, isCall);
    return g.theo ?? 0;
  }
  const pay = (s: number) =>
    isCall ? Math.max(s - k, 0) : Math.max(k - s, 0);
  /*
   * Precompute u^i / d^i once. The tree used to call Math.pow twice per node
   * (~2 × 12.8k calls per 160-step tree, ×9 trees per American quote), which
   * dominated the cost of dragging the valuation-date slider.
   */
  const uPow = new Float64Array(steps + 1);
  const dPow = new Float64Array(steps + 1);
  uPow[0] = 1;
  dPow[0] = 1;
  for (let i = 1; i <= steps; i++) {
    uPow[i] = uPow[i - 1]! * u;
    dPow[i] = dPow[i - 1]! * d;
  }
  const values = new Float64Array(steps + 1);
  for (let i = 0; i <= steps; i++) {
    values[i] = pay(spot * uPow[steps - i]! * dPow[i]!);
  }
  for (let n = steps - 1; n >= 0; n--) {
    for (let i = 0; i <= n; i++) {
      const cont = disc * (p * values[i]! + (1 - p) * values[i + 1]!);
      const exercise = pay(spot * uPow[n - i]! * dPow[i]!);
      values[i] = cont > exercise ? cont : exercise; // early exercise
    }
  }
  return values[0]!;
}

function american(
  spot: number,
  k: number,
  sigma: number,
  T: number,
  r: number,
  isCall: boolean,
): CalcResult {
  const price = (s: number) => crrPrice(s, k, sigma, T, r, isCall);
  const theo = price(spot);
  // Greeks via central finite differences on the tree. Reuse the two bumped
  // spot prices for delta and gamma instead of pricing them twice.
  const hS = Math.max(spot * 0.005, 0.01);
  const up = price(spot + hS);
  const dn = price(spot - hS);
  const delta = (up - dn) / (2 * hS);
  const gamma = (up - 2 * theo + dn) / (hS * hS);
  const hV = Math.max(sigma * 0.01, 0.0005);
  const vega =
    (crrPrice(spot, k, sigma + hV, T, r, isCall) -
      crrPrice(spot, k, sigma - hV, T, r, isCall)) /
    (2 * hV) /
    100;
  const hT = Math.max(T * 0.005, 1 / 365 / 4);
  const theta =
    -(crrPrice(spot, k, sigma, T + hT, r, isCall) -
      crrPrice(spot, k, sigma, Math.max(T - hT, 1e-6), r, isCall)) /
    (2 * hT) /
    365;
  const hR = 0.0025;
  const rho =
    (crrPrice(spot, k, sigma, T, r + hR, isCall) -
      crrPrice(spot, k, sigma, T, Math.max(r - hR, 1e-6), isCall)) /
    (2 * hR) /
    100;
  return { theo, dist: theo - spot, delta, gamma, vega, theta, rho };
}

/** Price + greeks for the calculator. Returns nulls when inputs are invalid. */
export function calcOption(input: CalcInput): CalcResult {
  const { spot, strike, isCall, model } = input;
  if (!(spot > 0) || !(strike > 0)) return EMPTY;
  const sigma = input.ivPct > 2 ? input.ivPct / 100 : input.ivPct;
  if (!(sigma > 0)) return EMPTY;
  const T = Math.max(input.days, 0) / 365;
  const r = input.ratePct / 100;
  if (T <= 0) {
    // At expiry: intrinsic only.
    const intrinsic = isCall ? Math.max(spot - strike, 0) : Math.max(strike - spot, 0);
    return {
      theo: intrinsic,
      dist: intrinsic - spot,
      delta: intrinsic > 0 ? (isCall ? 1 : -1) : 0,
      gamma: 0,
      vega: 0,
      theta: 0,
      rho: 0,
    };
  }
  return model === "american"
    ? american(spot, strike, sigma, T, r, isCall)
    : bs(spot, strike, sigma, T, r, isCall);
}
