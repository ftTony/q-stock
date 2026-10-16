import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  ensurePaperRiskSettings,
  updatePaperRiskSettings,
} from "@/lib/trading/paper-risk-settings";
import { DEFAULT_RISK_SETTINGS } from "@/lib/trading/risk-math";
import { prisma } from "@/lib/db";
import { ensureAccount, serializeAccount } from "@/lib/trading/account";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await ensurePaperRiskSettings(session.user.id);
  const account = await ensureAccount(session.user.id);

  let dayPnlPct: number | null = null;
  const dayStart =
    account.dayStartEquity != null ? Number(account.dayStartEquity) : null;
  if (dayStart != null && dayStart > 0) {
    const positions = await prisma.paperPosition.findMany({
      where: { userId: session.user.id },
      take: 80,
    });
    let gross = 0;
    for (const p of positions) {
      gross += Number(p.qty) * Number(p.avgCost);
    }
    const equity = Number(account.cashBalance) + gross;
    dayPnlPct = ((equity - dayStart) / dayStart) * 100;
  }

  return NextResponse.json({
    settings,
    defaults: DEFAULT_RISK_SETTINGS,
    account: serializeAccount(account),
    dayPnlPct,
    circuitBroken:
      dayPnlPct != null && dayPnlPct <= -Math.abs(settings.maxDailyLossPct),
  });
}

const patchSchema = z.object({
  maxPositionPctPerSymbol: z.number().min(1).max(100).optional(),
  maxGrossExposurePct: z.number().min(1).max(200).optional(),
  maxDailyLossPct: z.number().min(0.5).max(50).optional(),
  maxOrderNotionalPct: z.number().min(1).max(100).nullable().optional(),
  softOnly: z.boolean().optional(),
  requireEmotionCheck: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const settings = await updatePaperRiskSettings(
    session.user.id,
    parsed.data,
  );
  return NextResponse.json({ settings });
}
