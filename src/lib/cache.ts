import { prisma } from "@/lib/db";

type CacheEntry<T> = { value: T; expiresAt: number };

const memory = new Map<string, CacheEntry<unknown>>();

/** Soft cap for in-process cache (1GB hosts cannot keep unbounded Maps). */
function memoryMaxEntries(): number {
  const n = Number(process.env.CACHE_MEMORY_MAX || 250);
  if (!Number.isFinite(n)) return 250;
  return Math.min(2000, Math.max(50, Math.floor(n)));
}

function touchMemory(key: string, entry: CacheEntry<unknown>) {
  // Re-insert so Map insertion order approximates LRU.
  memory.delete(key);
  memory.set(key, entry);
  trimMemory();
}

function trimMemory() {
  const now = Date.now();
  for (const [k, v] of memory) {
    if (v.expiresAt <= now) memory.delete(k);
  }
  const max = memoryMaxEntries();
  while (memory.size > max) {
    const oldest = memory.keys().next().value;
    if (oldest === undefined) break;
    memory.delete(oldest);
  }
}

export async function getCached<T>(key: string): Promise<T | null> {
  const now = Date.now();
  const mem = memory.get(key);
  if (mem && mem.expiresAt > now) {
    touchMemory(key, mem);
    return mem.value as T;
  }
  if (mem) memory.delete(key);

  try {
    const row = await prisma.apiCache.findUnique({ where: { key } });
    if (!row) return null;
    if (row.expiresAt.getTime() <= now) {
      await prisma.apiCache.delete({ where: { key } }).catch(() => undefined);
      return null;
    }
    touchMemory(key, {
      value: row.value,
      expiresAt: row.expiresAt.getTime(),
    });
    return row.value as T;
  } catch {
    return null;
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  ttlMs: number,
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlMs);
  touchMemory(key, { value, expiresAt: expiresAt.getTime() });
  try {
    await prisma.apiCache.upsert({
      where: { key },
      create: { key, value: value as object, expiresAt },
      update: { value: value as object, expiresAt },
    });
  } catch {
    // DB cache is best-effort
  }
}

export async function deleteCached(key: string): Promise<void> {
  memory.delete(key);
  try {
    await prisma.apiCache.delete({ where: { key } }).catch(() => undefined);
  } catch {
    /* ignore */
  }
}

export async function cachedFetch<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const hit = await getCached<T>(key);
  if (hit !== null) return hit;
  const value = await fetcher();
  await setCached(key, value, ttlMs);
  return value;
}
