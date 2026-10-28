import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getEntitlements } from "@/lib/billing/entitlements";
import { redeemCode } from "@/lib/billing/redeem";

const bodySchema = z.object({
  code: z.string().min(4).max(64),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const result = await redeemCode(session.user.id, parsed.data.code);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status: 400 },
    );
  }

  const entitlements = await getEntitlements(session.user.id);
  return NextResponse.json({
    ok: true,
    days: result.days,
    planExpiresAt: result.planExpiresAt,
    entitlements,
  });
}
