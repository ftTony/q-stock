import { prisma } from "@/lib/db";
import { DEFAULT_RISK_SETTINGS } from "@/lib/trading/risk-math";

export type PaperRiskSettingsDto = {
  maxPositionPctPerSymbol: number;
  maxGrossExposurePct: number;
  maxDailyLossPct: number;
  maxOrderNotionalPct: number | null;
  softOnly: boolean;
  requireEmotionCheck: boolean;
};

export function serializeRiskSettings(row: {
  maxPositionPctPerSymbol: number;
  maxGrossExposurePct: number;
  maxDailyLossPct: number;
  maxOrderNotionalPct: number | null;
  softOnly: boolean;
  requireEmotionCheck: boolean;
}): PaperRiskSettingsDto {
  return {
    maxPositionPctPerSymbol: row.maxPositionPctPerSymbol,
    maxGrossExposurePct: row.maxGrossExposurePct,
    maxDailyLossPct: row.maxDailyLossPct,
    maxOrderNotionalPct: row.maxOrderNotionalPct,
    softOnly: row.softOnly,
    requireEmotionCheck: row.requireEmotionCheck,
  };
}

export async function ensurePaperRiskSettings(
  userId: string,
): Promise<PaperRiskSettingsDto> {
  const row = await prisma.paperRiskSettings.upsert({
    where: { userId },
    create: {
      userId,
      ...DEFAULT_RISK_SETTINGS,
    },
    update: {},
  });
  return serializeRiskSettings(row);
}

export async function updatePaperRiskSettings(
  userId: string,
  patch: Partial<PaperRiskSettingsDto>,
): Promise<PaperRiskSettingsDto> {
  await ensurePaperRiskSettings(userId);
  const row = await prisma.paperRiskSettings.update({
    where: { userId },
    data: {
      ...(patch.maxPositionPctPerSymbol != null
        ? { maxPositionPctPerSymbol: patch.maxPositionPctPerSymbol }
        : {}),
      ...(patch.maxGrossExposurePct != null
        ? { maxGrossExposurePct: patch.maxGrossExposurePct }
        : {}),
      ...(patch.maxDailyLossPct != null
        ? { maxDailyLossPct: patch.maxDailyLossPct }
        : {}),
      ...(patch.maxOrderNotionalPct !== undefined
        ? { maxOrderNotionalPct: patch.maxOrderNotionalPct }
        : {}),
      ...(patch.softOnly != null ? { softOnly: patch.softOnly } : {}),
      ...(patch.requireEmotionCheck != null
        ? { requireEmotionCheck: patch.requireEmotionCheck }
        : {}),
    },
  });
  return serializeRiskSettings(row);
}
