import { auth } from "@/lib/auth";
import { resolveAiConfig } from "@/lib/ai/client";
import {
  consumeAiQuota,
  peekAiQuota,
  type AiQuotaSnapshot,
} from "@/lib/ai/usage";
import { trackConversionEvent } from "@/lib/billing/events";

export async function requireAiUser(): Promise<
  { ok: true; userId: string } | { ok: false; response: Response }
> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      ok: false,
      response: Response.json(
        { error: "Unauthorized", code: "AI_LOGIN_REQUIRED" },
        { status: 401 },
      ),
    };
  }
  return { ok: true, userId };
}

export function aiQuotaExceededResponse(quota: AiQuotaSnapshot): Response {
  return Response.json(
    {
      error: "AI quota exceeded",
      code: "AI_QUOTA_EXCEEDED",
      used: quota.used,
      limit: quota.limit,
      remaining: quota.remaining,
      mode: quota.mode,
    },
    { status: 429 },
  );
}

/**
 * Require login then consume platform quota.
 * User BYOK (`resolveAiConfig` source=user) does not consume platform quota.
 */
export async function requireAiQuota(cost = 1): Promise<
  | { ok: true; userId: string; quota: AiQuotaSnapshot }
  | { ok: false; response: Response }
> {
  const gate = await requireAiUser();
  if (!gate.ok) return gate;

  const config = await resolveAiConfig(gate.userId);
  if (config?.source === "user") {
    const quota = await peekAiQuota(gate.userId);
    return {
      ok: true,
      userId: gate.userId,
      quota: { ...quota, ok: true, mode: "byok" },
    };
  }

  const quota = await consumeAiQuota(gate.userId, cost);
  if (!quota.ok) {
    return { ok: false, response: aiQuotaExceededResponse(quota) };
  }
  if (quota.used === cost) {
    void trackConversionEvent("first_ai", { userId: gate.userId });
  }
  return { ok: true, userId: gate.userId, quota };
}

export async function getAiQuotaForUser(userId: string) {
  return peekAiQuota(userId);
}
