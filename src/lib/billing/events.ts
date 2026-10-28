import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export const CONVERSION_EVENTS = [
  "register",
  "first_watchlist",
  "first_ai",
  "quota_exhausted",
  "click_invite",
  "click_byok",
  "click_upgrade",
  "checkout_start",
  "checkout_success",
  "redeem_success",
] as const;

export type ConversionEventName = (typeof CONVERSION_EVENTS)[number];

export function isConversionEvent(value: string): value is ConversionEventName {
  return (CONVERSION_EVENTS as readonly string[]).includes(value);
}

/** Fire-and-forget friendly; never throws to callers. */
export async function trackConversionEvent(
  event: ConversionEventName,
  opts?: {
    userId?: string | null;
    meta?: Prisma.InputJsonValue | Record<string, unknown>;
  },
): Promise<void> {
  try {
    await prisma.conversionEvent.create({
      data: {
        event,
        userId: opts?.userId ?? null,
        meta: (opts?.meta as Prisma.InputJsonValue | undefined) ?? undefined,
      },
    });
  } catch (err) {
    console.error("[billing] trackConversionEvent failed:", event, err);
  }
}
