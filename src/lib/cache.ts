import { prisma } from "@/lib/db";

type CacheEntry<T> = { value: T; expiresAt: number };

const memory = new Map<string, CacheEntry<unknown>>();

export async function getCached<T>(key: string): Promise<T | null> {
  const now = Date.now();
  const mem = memory.get(key);
  if (mem && mem.expiresAt > now) {
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
    memory.set(key, { value: row.value, expiresAt: row.expiresAt.getTime() });
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
  memory.set(key, { value, expiresAt: expiresAt.getTime() });
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
