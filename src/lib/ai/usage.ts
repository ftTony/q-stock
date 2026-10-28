import type { Prisma, UserPlan } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PRO_AI_MONTHLY_LIMIT } from "@/lib/billing/limits";
import { trackConversionEvent } from "@/lib/billing/events";

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
  /** free = lifetime pool; pro = calendar-month pool; byok = no platform consume */
  mode: "free" | "pro" | "byok";
};

type QuotaUser = {
  plan: UserPlan;
  planExpiresAt: Date | null;
  aiUsageCount: number;
  aiUsageLimit: number;
  aiUsagePeriod: string | null;
  aiPeriodUsageCount: number;
};

function snapshot(
  used: number,
  limit: number,
  ok: boolean,
  mode: AiQuotaSnapshot["mode"],
): AiQuotaSnapshot {
  return {
    ok,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    mode,
  };
}

function periodKey(d = new Date()): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function isProActive(user: Pick<QuotaUser, "plan" | "planExpiresAt">): boolean {
  if (user.plan !== "pro") return false;
  if (!user.planExpiresAt) return true;
  return user.planExpiresAt.getTime() > Date.now();
}

const quotaSelect = {
  plan: true,
  planExpiresAt: true,
  aiUsageCount: true,
  aiUsageLimit: true,
  aiUsagePeriod: true,
  aiPeriodUsageCount: true,
} as const;

async function ensureProPeriod(
  userId: string,
  user: QuotaUser,
): Promise<QuotaUser> {
  const key = periodKey();
  if (user.aiUsagePeriod === key) return user;
  await prisma.user.update({
    where: { id: userId },
    data: { aiUsagePeriod: key, aiPeriodUsageCount: 0 },
  });
  return { ...user, aiUsagePeriod: key, aiPeriodUsageCount: 0 };
}

/** Read current AI quota (authenticated users only). */
export async function peekAiQuota(userId: string): Promise<AiQuotaSnapshot> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: quotaSelect,
  });
  if (!user) return snapshot(0, 0, false, "free");

  if (isProActive(user)) {
    const synced = await ensureProPeriod(userId, user);
    return snapshot(
      synced.aiPeriodUsageCount,
      PRO_AI_MONTHLY_LIMIT,
      synced.aiPeriodUsageCount < PRO_AI_MONTHLY_LIMIT,
      "pro",
    );
  }

  return snapshot(
    user.aiUsageCount,
    user.aiUsageLimit,
    user.aiUsageCount < user.aiUsageLimit,
    "free",
  );
}

/**
 * Atomically consume platform AI uses.
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
      select: quotaSelect,
    });
    if (!user) return snapshot(0, 0, false, "free");

    if (isProActive(user)) {
      const synced = await ensureProPeriod(userId, user);
      if (synced.aiPeriodUsageCount + cost > PRO_AI_MONTHLY_LIMIT) {
        const snap = snapshot(
          synced.aiPeriodUsageCount,
          PRO_AI_MONTHLY_LIMIT,
          false,
          "pro",
        );
        if (attempt === 0) {
          void trackConversionEvent("quota_exhausted", {
            userId,
            meta: { mode: "pro" },
          });
        }
        return snap;
      }
      const updated = await prisma.user.updateMany({
        where: {
          id: userId,
          aiUsagePeriod: synced.aiUsagePeriod,
          aiPeriodUsageCount: synced.aiPeriodUsageCount,
        },
        data: { aiPeriodUsageCount: { increment: cost } },
      });
      if (updated.count === 1) {
        return snapshot(
          synced.aiPeriodUsageCount + cost,
          PRO_AI_MONTHLY_LIMIT,
          true,
          "pro",
        );
      }
      continue;
    }

    if (user.aiUsageCount + cost > user.aiUsageLimit) {
      const snap = snapshot(
        user.aiUsageCount,
        user.aiUsageLimit,
        false,
        "free",
      );
      if (attempt === 0) {
        void trackConversionEvent("quota_exhausted", {
          userId,
          meta: { mode: "free" },
        });
      }
      return snap;
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
        "free",
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
