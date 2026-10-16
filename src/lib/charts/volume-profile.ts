import type { OhlcvBar } from "@/lib/types";

export type VpBucket = {
  price: number;
  volume: number;
  pct: number;
};

export type VolumeProfile = {
  buckets: VpBucket[];
  poc: number | null;
  val: number | null;
  vah: number | null;
  totalVolume: number;
};

/**
 * Local volume profile from OHLCV (no L2).
 * Distributes each bar's volume across its high–low range into price buckets.
 */
export function buildVolumeProfile(
  bars: OhlcvBar[],
  bucketCount = 24,
): VolumeProfile {
  const n = Math.min(48, Math.max(8, bucketCount));
  const usable = bars.filter(
    (b) =>
      b.volume > 0 &&
      Number.isFinite(b.high) &&
      Number.isFinite(b.low) &&
      b.high >= b.low,
  );
  if (!usable.length) {
    return { buckets: [], poc: null, val: null, vah: null, totalVolume: 0 };
  }

  let lo = Infinity;
  let hi = -Infinity;
  for (const b of usable) {
    lo = Math.min(lo, b.low);
    hi = Math.max(hi, b.high);
  }
  if (!(hi > lo)) {
    const mid = usable[usable.length - 1]!.close;
    return {
      buckets: [{ price: mid, volume: usable.reduce((s, b) => s + b.volume, 0), pct: 100 }],
      poc: mid,
      val: mid,
      vah: mid,
      totalVolume: usable.reduce((s, b) => s + b.volume, 0),
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
  if (!(totalVolume > 0)) {
    return { buckets: [], poc: null, val: null, vah: null, totalVolume: 0 };
  }

  let pocIdx = 0;
  for (let i = 1; i < n; i++) {
    if (vols[i]! > vols[pocIdx]!) pocIdx = i;
  }

  // Value area ≈ 70% of volume expanding from POC
  let covered = vols[pocIdx]!;
  let left = pocIdx;
  let right = pocIdx;
  const target = totalVolume * 0.7;
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

  const buckets: VpBucket[] = vols.map((volume, i) => ({
    price: lo + (i + 0.5) * step,
    volume,
    pct: (volume / totalVolume) * 100,
  }));

  return {
    buckets,
    poc: buckets[pocIdx]!.price,
    val: buckets[left]!.price,
    vah: buckets[right]!.price,
    totalVolume,
  };
}
