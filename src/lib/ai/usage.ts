import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/** New accounts start with this many AI uses. */
export const AI_USAGE_INITIAL = 5;
/** Inviter gains this many uses when an invitee successfully registers. */
export const AI_USAGE_INVITE_BONUS = 5;

type Db = Prisma.TransactionClient | typeof prisma;

export type AiQuotaSnapshot = {
  ok: boolean;
  used: number;
  limit: number;
  remaining: number;
};

function snapshot(
  used: number,
  limit: number,
  ok: boolean,
): AiQuotaSnapshot {
  return {
    ok,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

/** Read current lifetime AI quota (authenticated users only). */
export async function peekAiQuota(userId: string): Promise<AiQuotaSnapshot> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiUsageCount: true, aiUsageLimit: true },
  });
  if (!user) return snapshot(0, 0, false);
  return snapshot(
    user.aiUsageCount,
    user.aiUsageLimit,
    user.aiUsageCount < user.aiUsageLimit,
  );
}

/**
 * Atomically consume AI uses. Optimistic lock on `aiUsageCount`.
 * Returns `ok: false` when insufficient remaining quota.
 */
export async function consumeAiQuota(
  userId: string,
  cost = 1,
): Promise<AiQuotaSnapshot> {
  if (cost < 1) return peekAiQuota(userId);

  for (let attempt = 0; attempt < 4; attempt++) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { aiUsageCount: true, aiUsageLimit: true },
    });
    if (!user) return snapshot(0, 0, false);

    if (user.aiUsageCount + cost > user.aiUsageLimit) {
      return snapshot(user.aiUsageCount, user.aiUsageLimit, false);
    }

    const updated = await prisma.user.updateMany({
      where: { id: userId, aiUsageCount: user.aiUsageCount },
      data: { aiUsageCount: { increment: cost } },
    });
    if (updated.count === 1) {
      return snapshot(
        user.aiUsageCount + cost,
        user.aiUsageLimit,
        true,
      );
    }
  }

  return peekAiQuota(userId).then((q) => ({ ...q, ok: false }));
}

/** Grant inviter +N lifetime AI uses after a successful invite redeem. */
export async function grantInviteAiBonus(
  ownerId: string,
  tx: Db = prisma,
  bonus = AI_USAGE_INVITE_BONUS,
): Promise<void> {
  if (bonus < 1) return;
  await tx.user.update({
    where: { id: ownerId },
    data: { aiUsageLimit: { increment: bonus } },
  });
}
