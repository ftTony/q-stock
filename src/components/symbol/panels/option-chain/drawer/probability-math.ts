/**
 * Log-normal (GBM) probability cone for options drawer education UI.
 * Drift uses risk-neutral μ = r − σ²/2 under Black–Scholes assumptions.
 */

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

export function normCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

/** Approximate Φ⁻¹ via Acklam rational approximation. */
export function normInv(p: number): number {
  const pp = Math.min(Math.max(p, 1e-10), 1 - 1e-10);
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const plow = 0.02425;
  const phigh = 1 - plow;
  if (pp < plow) {
    const q = Math.sqrt(-2 * Math.log(pp));
    return (
      (((((c[0]! * q + c[1]!) * q + c[2]!) * q + c[3]!) * q + c[4]!) * q +
        c[5]!) /
      ((((d[0]! * q + d[1]!) * q + d[2]!) * q + d[3]!) * q + 1)
    );
  }
  if (pp > phigh) {
    const q = Math.sqrt(-2 * Math.log(1 - pp));
    return (
      -(((((c[0]! * q + c[1]!) * q + c[2]!) * q + c[3]!) * q + c[4]!) * q +
        c[5]!) /
      ((((d[0]! * q + d[1]!) * q + d[2]!) * q + d[3]!) * q + 1)
    );
  }
  const q = pp - 0.5;
  const r = q * q;
  return (
    ((((((a[0]! * r + a[1]!) * r + a[2]!) * r + a[3]!) * r + a[4]!) * r +
      a[5]!) *
      q) /
    (((((b[0]! * r + b[1]!) * r + b[2]!) * r + b[3]!) * r + b[4]!) * r + 1)
  );
}

export type ProbMode = "inside" | "above" | "below";

export type ConePoint = {
  /** Calendar days from today (0 = now). */
  days: number;
  dateMs: number;
  upper: number;
  lower: number;
  /** Mid / forward under risk-neutral drift. */
  mid: number;
};

function sigmaOf(ivPct: number): number {
  return ivPct > 2 ? ivPct / 100 : ivPct;
}

/** z for two-sided confidence `confPct` (e.g. 68 → ~1σ). */
export function confToZ(confPct: number): number {
  const p = Math.min(Math.max(confPct, 1), 99.9) / 100;
  return normInv(0.5 + p / 2);
}

/**
 * Build expanding upper/lower bands from spot to expiry.
 * `steps` samples along the calendar path (inclusive of day 0 and expiry).
 */
export function buildProbabilityCone(input: {
  spot: number;
  ivPct: number;
  daysToExpiry: number;
  ratePct?: number;
  confPct?: number;
  steps?: number;
}): ConePoint[] {
  const spot = input.spot;
  const sigma = sigmaOf(input.ivPct);
  const days = Math.max(0, Math.floor(input.daysToExpiry));
  const r = (input.ratePct ?? 0) / 100;
  const z = confToZ(input.confPct ?? 68);
  const steps = Math.min(120, Math.max(16, input.steps ?? 48));
  if (!(spot > 0) || !(sigma > 0)) return [];

  const now = Date.now();
  const out: ConePoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const d = days <= 0 ? 0 : (days * i) / steps;
    const T = d / 365;
    const drift = (r - (sigma * sigma) / 2) * T;
    const vol = sigma * Math.sqrt(T);
    const mid = spot * Math.exp(drift);
    const upper = spot * Math.exp(drift + z * vol);
    const lower = spot * Math.exp(drift - z * vol);
    out.push({
      days: d,
      dateMs: now + d * 86_400_000,
      upper: i === 0 ? spot : upper,
      lower: i === 0 ? spot : lower,
      mid: i === 0 ? spot : mid,
    });
  }
  return out;
}

/** Half expected-move as % of spot at horizon (matches Futu-style side %). */
export function expectedMovePct(
  spot: number,
  ivPct: number,
  days: number,
  confPct: number,
  ratePct = 0,
): number | null {
  if (!(spot > 0) || days < 0) return null;
  const sigma = sigmaOf(ivPct);
  if (!(sigma > 0)) return null;
  const T = days / 365;
  const z = confToZ(confPct);
  const r = ratePct / 100;
  const upper = spot * Math.exp((r - (sigma * sigma) / 2) * T + z * sigma * Math.sqrt(T));
  return ((upper - spot) / spot) * 100;
}

/** P(S_t > level) under log-normal; returns [pAbove, pBelow]. */
export function probAboveBelow(input: {
  spot: number;
  level: number;
  ivPct: number;
  days: number;
  ratePct?: number;
}): { above: number; below: number } | null {
  const { spot, level } = input;
  const sigma = sigmaOf(input.ivPct);
  const days = Math.max(input.days, 0);
  const r = (input.ratePct ?? 0) / 100;
  if (!(spot > 0) || !(level > 0) || !(sigma > 0)) return null;
  if (days <= 0) {
    if (level < spot) return { above: 1, below: 0 };
    if (level > spot) return { above: 0, below: 1 };
    return { above: 0.5, below: 0.5 };
  }
  const T = days / 365;
  const vol = sigma * Math.sqrt(T);
  const mu = Math.log(spot) + (r - (sigma * sigma) / 2) * T;
  // P(S > K) = Φ((μ − ln K) / (σ√T)) with S~LogNormal
  const z = (mu - Math.log(level)) / vol;
  const above = normCdf(z);
  return { above, below: 1 - above };
}

export function formatConeDate(ms: number): string {
  const d = new Date(ms);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  // Near-term: MM/DD; far: YY/MM/DD (matches broker cone labels)
  const now = new Date();
  if (d.getFullYear() === now.getFullYear()) return `${mm}/${dd}`;
  return `${yy}/${mm}/${dd}`;
}
