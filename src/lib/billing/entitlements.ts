import type { UserPlan } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/billing/limits";

export type Entitlements = {
  plan: "free" | "pro";
  planExpiresAt: string | null;
  isPro: boolean;
  watchlistLimit: number;
  alertLimit: number;
  researchCardLimit: number;
  aiMonthlyLimit: number | null;
  stripeEnabled: boolean;
};

function isProActive(
  plan: UserPlan,
  planExpiresAt: Date | null,
  now = new Date(),
): boolean {
  if (plan !== "pro") return false;
  if (!planExpiresAt) return true;
  return planExpiresAt.getTime() > now.getTime();
}

export async function getEntitlements(userId: string): Promise<Entitlements> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpiresAt: true },
  });

  const isPro = user
    ? isProActive(user.plan, user.planExpiresAt)
    : false;
  const tier = isPro ? "pro" : "free";
  const limits = PLAN_LIMITS[tier];

  return {
    plan: tier,
    planExpiresAt: user?.planExpiresAt?.toISOString() ?? null,
    isPro,
    watchlistLimit: limits.watchlist,
    alertLimit: limits.alerts,
    researchCardLimit: limits.researchCards,
    aiMonthlyLimit: limits.aiMonthly,
    stripeEnabled: Boolean(
      process.env.STRIPE_SECRET_KEY?.trim() &&
        process.env.STRIPE_PRICE_PRO_MONTHLY?.trim(),
    ),
  };
}

export function limitExceededResponse(
  kind: "watchlist" | "alerts" | "researchCards",
  limit: number,
): Response {
  return Response.json(
    {
      error: `${kind} limit reached`,
      code: "PLAN_LIMIT_EXCEEDED",
      kind,
      limit,
      upgradePath: "/pricing",
    },
    { status: 403 },
  );
}
