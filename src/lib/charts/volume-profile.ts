import type { OhlcvBar } from "@/lib/types";

export type VpBucket = {
  price: number;
  volume: number;
  pct: number;
};

export type VolumeProfile = {
  buckets: VpBucket[];
  /** Peak-volume price (POC). */
  poc: number | null;
  /** 70% value-area low / high. */
  val: number | null;
  vah: number | null;
  /** 90% chip-range low / high. */
  r90Lo: number | null;
  r90Hi: number | null;
  lastPrice: number | null;
  /** Volume-weighted average price ≈ 平均成本. */
  avgCost: number | null;
  /** Share of volume below lastPrice (获利比例). */
  profitPct: number | null;
  /**
   * How tight the 70% band is vs full range (0–100).
   * Higher = chips more concentrated.
   */
  concentrationPct: number | null;
  priceLo: number | null;
  priceHi: number | null;
  totalVolume: number;
  fromTs: number | null;
  toTs: number | null;
};

function emptyProfile(): VolumeProfile {
  return {
    buckets: [],
    poc: null,
    val: null,
    vah: null,
    r90Lo: null,
    r90Hi: null,
    lastPrice: null,
    avgCost: null,
    profitPct: null,
    concentrationPct: null,
    priceLo: null,
    priceHi: null,
    totalVolume: 0,
    fromTs: null,
    toTs: null,
  };
}

/** Expand indices from POC until `target` volume is covered. */
function expandRange(
  vols: number[],
  pocIdx: number,
  totalVolume: number,
  ratio: number,
): [number, number] {
  let covered = vols[pocIdx]!;
  let left = pocIdx;
  let right = pocIdx;
  const target = totalVolume * ratio;
  const n = vols.length;
  while (covered < target && (left > 0 || right < n - 1)) {
    const takeLeft = left > 0 ? vols[left - 1]! : -1;
    const takeRight = right < n - 1 ? vols[right + 1]! : -1;
    if (takeLeft >= takeRight) {
      left -= 1;
      covered += vols[left]!;
    } else {
      right += 1;
      covered += vols[right]!;
    }
  }
  return [left, right];
}

/**
 * Local volume / chip profile from OHLCV (no L2).
 * Distributes each bar's volume across its high–low range into price buckets.
 */
export function buildVolumeProfile(
  bars: OhlcvBar[],
  bucketCount = 40,
): VolumeProfile {
  const n = Math.min(64, Math.max(16, bucketCount));
  const usable = bars.filter(
    (b) =>
      b.volume > 0 &&
      Number.isFinite(b.high) &&
      Number.isFinite(b.low) &&
      b.high >= b.low,
  );
  if (!usable.length) return emptyProfile();

  let lo = Infinity;
  let hi = -Infinity;
  for (const b of usable) {
    lo = Math.min(lo, b.low);
    hi = Math.max(hi, b.high);
  }
  const lastPrice = usable[usable.length - 1]!.close;
  const fromTs = usable[0]!.time ?? null;
  const toTs = usable[usable.length - 1]!.time ?? null;

  if (!(hi > lo)) {
    const mid = lastPrice;
    const vol = usable.reduce((s, b) => s + b.volume, 0);
    return {
      ...emptyProfile(),
      buckets: [{ price: mid, volume: vol, pct: 100 }],
      poc: mid,
      val: mid,
      vah: mid,
      r90Lo: mid,
      r90Hi: mid,
      lastPrice: mid,
      avgCost: mid,
      profitPct: 50,
      concentrationPct: 100,
      priceLo: mid,
      priceHi: mid,
      totalVolume: vol,
      fromTs,
      toTs,
    };
  }

  const step = (hi - lo) / n;
  const vols = new Array<number>(n).fill(0);
  for (const b of usable) {
    const i0 = Math.max(0, Math.min(n - 1, Math.floor((b.low - lo) / step)));
    const i1 = Math.max(0, Math.min(n - 1, Math.floor((b.high - lo) / step)));
    const span = i1 - i0 + 1;
    const share = b.volume / span;
    for (let i = i0; i <= i1; i++) vols[i]! += share;
  }

  const totalVolume = vols.reduce((s, v) => s + v, 0);
  if (!(totalVolume > 0)) return emptyProfile();

  let pocIdx = 0;
  for (let i = 1; i < n; i++) {
    if (vols[i]! > vols[pocIdx]!) pocIdx = i;
  }

  const [left70, right70] = expandRange(vols, pocIdx, totalVolume, 0.7);
  const [left90, right90] = expandRange(vols, pocIdx, totalVolume, 0.9);

  const buckets: VpBucket[] = vols.map((volume, i) => ({
    price: lo + (i + 0.5) * step,
    volume,
    pct: (volume / totalVolume) * 100,
  }));

  let weighted = 0;
  for (const b of buckets) weighted += b.price * b.volume;
  const avgCost = weighted / totalVolume;

  let profitVol = 0;
  for (const b of buckets) {
    if (b.price < lastPrice) profitVol += b.volume;
  }
  const profitPct = (profitVol / totalVolume) * 100;

  const band70 = buckets[right70]!.price - buckets[left70]!.price;
  const full = hi - lo;
  const concentrationPct =
    full > 0 ? Math.max(0, Math.min(100, (1 - band70 / full) * 100)) : 0;

  return {
    buckets,
    poc: buckets[pocIdx]!.price,
    val: buckets[left70]!.price,
    vah: buckets[right70]!.price,
    r90Lo: buckets[left90]!.price,
    r90Hi: buckets[right90]!.price,
    lastPrice,
    avgCost,
    profitPct,
    concentrationPct,
    priceLo: lo,
    priceHi: hi,
    totalVolume,
    fromTs,
    toTs,
  };
}
