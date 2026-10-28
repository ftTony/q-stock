import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  isConversionEvent,
  trackConversionEvent,
} from "@/lib/billing/events";

const bodySchema = z.object({
  event: z.string().min(1).max(64),
  meta: z.record(z.string(), z.any()).optional(),
});

/** Client-side funnel clicks (invite / BYOK / upgrade). */
export async function POST(req: Request) {
  const session = await auth();
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !isConversionEvent(parsed.data.event)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const allowed = new Set([
    "click_invite",
    "click_byok",
    "click_upgrade",
  ]);
  if (!allowed.has(parsed.data.event)) {
    return NextResponse.json({ error: "Event not allowed" }, { status: 400 });
  }

  await trackConversionEvent(parsed.data.event, {
    userId: session?.user?.id ?? null,
    meta: parsed.data.meta,
  });

  return NextResponse.json({ ok: true });
}
