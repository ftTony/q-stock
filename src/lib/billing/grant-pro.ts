import type { Prisma, UserPlan } from "@prisma/client";
import { prisma } from "@/lib/db";

type Db = Prisma.TransactionClient | typeof prisma;

/**
 * Grant or extend Pro. If already Pro with a later expiry, keep the later date
 * unless `days` extends further from now.
 */
export async function grantProPlan(
  userId: string,
  opts: {
    days: number;
    source: string;
    note?: string;
    /** When set (e.g. Stripe period end), replaces computed expiry instead of stacking. */
    expiresAt?: Date | null;
    stripeSubscriptionId?: string | null;
    stripeCustomerId?: string | null;
    tx?: Db;
  },
): Promise<{ planExpiresAt: Date | null }> {
  const db = opts.tx ?? prisma;
  const days = Math.max(1, Math.floor(opts.days));
  const now = new Date();
  const fromNow = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpiresAt: true },
  });
  if (!user) throw new Error("User not found");

  let planExpiresAt: Date | null =
    opts.expiresAt !== undefined ? opts.expiresAt : fromNow;
  if (opts.expiresAt === undefined) {
    if (
      user.plan === "pro" &&
      user.planExpiresAt &&
      user.planExpiresAt.getTime() > fromNow.getTime()
    ) {
      planExpiresAt = user.planExpiresAt;
    } else if (
      user.plan === "pro" &&
      user.planExpiresAt &&
      user.planExpiresAt.getTime() > now.getTime()
    ) {
      planExpiresAt = new Date(
        user.planExpiresAt.getTime() + days * 24 * 60 * 60 * 1000,
      );
    }
  }

  const data: Prisma.UserUpdateInput = {
    plan: "pro" satisfies UserPlan,
    planExpiresAt,
  };
  if (opts.stripeCustomerId !== undefined) {
    data.stripeCustomerId = opts.stripeCustomerId;
  }
  if (opts.stripeSubscriptionId !== undefined) {
    data.stripeSubscriptionId = opts.stripeSubscriptionId;
  }

  await db.user.update({ where: { id: userId }, data });
  await db.entitlementGrant.create({
    data: {
      userId,
      plan: "pro",
      source: opts.source,
      days,
      note: opts.note,
    },
  });

  return { planExpiresAt };
}

export async function revokeProPlan(
  userId: string,
  opts?: { source?: string; note?: string; tx?: Db },
): Promise<void> {
  const db = opts?.tx ?? prisma;
  await db.user.update({
    where: { id: userId },
    data: {
      plan: "free",
      planExpiresAt: new Date(),
      stripeSubscriptionId: null,
    },
  });
  await db.entitlementGrant.create({
    data: {
      userId,
      plan: "free",
      source: opts?.source ?? "revoke",
      note: opts?.note,
    },
  });
}
