import { z } from "zod";
import { auth } from "@/lib/auth";
import { AiError, isAiConfigured } from "@/lib/ai/client";
import { compareSymbols } from "@/lib/ai/compare";
import { aiDisclaimer } from "@/lib/ai/guardrails";
import { consumeAiQuota } from "@/lib/ai/usage";
import { cachedFetch, getCached } from "@/lib/cache";
import { withUserMarket } from "@/lib/market/with-user-market";
import { parseAssetType } from "@/lib/types";

const TTL = 30 * 60_000;

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        symbol: z.string().min(1).max(20),
        assetType: z.enum(["stock", "hk", "crypto", "cn"]),
      }),
    )
    .min(2)
    .max(4),
  locale: z.string().max(12).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

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

    const items = parsed.data.items.map((i) => ({
      symbol: i.symbol.toUpperCase(),
      assetType: parseAssetType(i.assetType),
    }));
    const locale = parsed.data.locale || "en";
    const sortedKey = [...items]
      .map((i) => `${i.assetType}:${i.symbol}`)
      .sort()
      .join("|");
    const scope = userId || "env";
    const cacheKey = `ai:compare:${scope}:${locale}:${sortedKey}`;

    const hit = await getCached<Awaited<ReturnType<typeof compareSymbols>>>(
      cacheKey,
    );
    if (hit) return Response.json({ ...hit, cached: true });

    const quota = await consumeAiQuota(userId, items.length);
    if (!quota.ok) {
      return Response.json(
        { error: "AI daily quota exceeded", used: quota.used, limit: quota.limit },
        { status: 429 },
      );
    }

    return withUserMarket(userId ?? undefined, async () => {
      const result = await cachedFetch(cacheKey, TTL, () =>
        compareSymbols({ items, locale, userId }),
      );
      return Response.json({ ...result, cached: false });
    });
  } catch (err) {
    console.error("ai/compare", err);
    const msg =
      err instanceof AiError
        ? err.message
        : err instanceof Error
          ? err.message
          : "compare failed";
    return Response.json({ error: msg }, { status: 502 });
  }
}
