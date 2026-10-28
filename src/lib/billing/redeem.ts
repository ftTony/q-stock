import { prisma } from "@/lib/db";
import { grantProPlan } from "@/lib/billing/grant-pro";
import { trackConversionEvent } from "@/lib/billing/events";

export type RedeemResult =
  | { ok: true; planExpiresAt: string | null; days: number }
  | { ok: false; error: string; code: string };

export async function redeemCode(
  userId: string,
  rawCode: string,
): Promise<RedeemResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code || code.length > 64) {
    return { ok: false, error: "Invalid code", code: "INVALID_CODE" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const row = await tx.redeemCode.findUnique({ where: { code } });
      if (!row) {
        return { ok: false as const, error: "Code not found", code: "NOT_FOUND" };
      }
      if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
        return { ok: false as const, error: "Code expired", code: "EXPIRED" };
      }
      if (row.redemptionCount >= row.maxRedemptions) {
        return {
          ok: false as const,
          error: "Code already used up",
          code: "EXHAUSTED",
        };
      }

      const prior = await tx.redeemRedemption.findUnique({
        where: { codeId_userId: { codeId: row.id, userId } },
      });
      if (prior) {
        return {
          ok: false as const,
          error: "You already redeemed this code",
          code: "ALREADY_REDEEMED",
        };
      }

      const updated = await tx.redeemCode.updateMany({
        where: {
          id: row.id,
          redemptionCount: row.redemptionCount,
        },
        data: { redemptionCount: { increment: 1 } },
      });
      if (updated.count !== 1) {
        return {
          ok: false as const,
          error: "Code already used up",
          code: "EXHAUSTED",
        };
      }

      await tx.redeemRedemption.create({
        data: { codeId: row.id, userId },
      });

      const granted = await grantProPlan(userId, {
        days: row.days,
        source: "redeem",
        note: `code:${row.code}`,
        tx,
      });

      return {
        ok: true as const,
        planExpiresAt: granted.planExpiresAt?.toISOString() ?? null,
        days: row.days,
      };
    });

    if (result.ok) {
      void trackConversionEvent("redeem_success", { userId, meta: { code } });
    }
    return result;
  } catch (err) {
    console.error("[billing] redeemCode failed:", err);
    return { ok: false, error: "Redeem failed", code: "SERVER_ERROR" };
  }
}
