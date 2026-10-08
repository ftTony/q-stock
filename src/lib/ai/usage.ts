import { getCached, setCached } from "@/lib/cache";

const DEFAULT_DAILY_LIMIT = Number(process.env.AI_DAILY_REQUEST_LIMIT || 80);

type UsageBucket = { count: number; day: string };

function utcDay(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function key(userId: string | null | undefined): string {
  return `ai:usage:${userId || "anon"}:${utcDay()}`;
}

/** Soft daily counter (best-effort via ApiCache). Returns remaining after increment. */
export async function consumeAiQuota(
  userId?: string | null,
  cost = 1,
): Promise<{ ok: boolean; used: number; limit: number }> {
  const limit = DEFAULT_DAILY_LIMIT;
  const k = key(userId);
  const hit = (await getCached<UsageBucket>(k)) ?? {
    count: 0,
    day: utcDay(),
  };
  const next = hit.count + cost;
  if (next > limit) {
    return { ok: false, used: hit.count, limit };
  }
  await setCached(k, { count: next, day: utcDay() }, 36 * 60 * 60_000);
  return { ok: true, used: next, limit };
}

export async function peekAiQuota(userId?: string | null): Promise<{
  used: number;
  limit: number;
}> {
  const limit = DEFAULT_DAILY_LIMIT;
  const hit = await getCached<UsageBucket>(key(userId));
  return { used: hit?.count ?? 0, limit };
}
