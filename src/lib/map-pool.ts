/** Run async work over `items` with a fixed concurrency cap. */
export async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<Awaited<R>[]> {
  const out: Awaited<R>[] = new Array(items.length);
  let i = 0;
  async function worker() {
    for (; ;) {
      const idx = i++;
      if (idx >= items.length) return;
      out[idx] = await fn(items[idx]!);
    }
  }
  const n = Math.max(1, Math.min(concurrency, items.length || 1));
  await Promise.all(Array.from({ length: n }, () => worker()));
  return out;
}

/** Like `Promise.allSettled` but with a concurrency cap; drops rejected results. */
export async function mapPoolSettled<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<Awaited<R>[]> {
  const settled = await mapPool(items, concurrency, async (item) => {
    try {
      return { ok: true as const, value: await fn(item) };
    } catch {
      return { ok: false as const };
    }
  });
  return settled
    .filter((r): r is { ok: true; value: Awaited<R> } => r.ok)
    .map((r) => r.value);
}
