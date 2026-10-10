import { z } from "zod";
import { AiError, isAiConfigured } from "@/lib/ai/client";
import { aiDisclaimer } from "@/lib/ai/guardrails";
import { requireAiQuota } from "@/lib/ai/http";
import { buildScenario } from "@/lib/ai/scenario";
import { prisma } from "@/lib/db";
import { withUserMarket } from "@/lib/market/with-user-market";
import { parseAssetType } from "@/lib/types";

const bodySchema = z.object({
  symbol: z.string().min(1).max(20),
  assetType: z.enum(["stock", "hk", "crypto", "cn"]),
  locale: z.string().max(12).optional(),
});

export async function POST(req: Request) {
  try {
    const access = await requireAiQuota(1);
    if (!access.ok) return access.response;
    const { userId } = access;

    if (!(await isAiConfigured(userId))) {
      return Response.json(
        { error: "AI is not configured", disclaimer: aiDisclaimer("en") },
        { status: 503 },
      );
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const symbol = parsed.data.symbol.toUpperCase();
    const assetType = parseAssetType(parsed.data.assetType);
    const locale = parsed.data.locale || "en";

    return withUserMarket(userId, async () => {
      const [account, position] = await Promise.all([
        prisma.paperAccount.findUnique({ where: { userId } }),
        prisma.paperPosition.findUnique({
          where: {
            userId_symbol_assetType: { userId, symbol, assetType },
          },
        }),
      ]);
      const paper = {
        cashBalance: account ? Number(account.cashBalance) : undefined,
        positionQty: position ? Number(position.qty) : undefined,
        avgCost: position ? Number(position.avgCost) : undefined,
      };

      const result = await buildScenario({
        symbol,
        assetType,
        locale,
        userId,
        paper,
      });
      return Response.json(result);
    });
  } catch (err) {
    console.error("ai/scenario", err);
    const msg =
      err instanceof AiError
        ? err.message
        : err instanceof Error
          ? err.message
          : "scenario failed";
    return Response.json({ error: msg }, { status: 502 });
  }
}
