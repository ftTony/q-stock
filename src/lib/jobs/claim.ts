/**
 * Atomic claim helpers for DB-backed jobs.
 * Pattern: find candidate → updateMany WHERE status still pending → only winner proceeds.
 */

export type ClaimCandidate = { id: string };

/**
 * Claim up to `limit` rows from a list of pending candidates using an atomic
 * status transition. Returns ids successfully claimed (lost races omitted).
 */
export async function claimByIds(
  candidates: ClaimCandidate[],
  claimOne: (id: string) => Promise<boolean>,
): Promise<string[]> {
  const claimed: string[] = [];
  for (const c of candidates) {
    const ok = await claimOne(c.id);
    if (ok) claimed.push(c.id);
  }
  return claimed;
}
