import { stepCountIs, type ModelMessage } from "ai";
import { z } from "zod";
import {
  AiError,
  isAiConfigured,
  streamAiText,
} from "@/lib/ai/client";
import { calmMarketSystemPrompt, aiDisclaimer } from "@/lib/ai/guardrails";
import { requireAiQuota } from "@/lib/ai/http";
import { createSymbolTools } from "@/lib/ai/tools/symbol-tools";
import { withUserMarket } from "@/lib/market/with-user-market";
import { parseAssetType } from "@/lib/types";

const bodySchema = z.object({
  symbol: z.string().min(1).max(20),
  assetType: z.enum(["stock", "hk", "crypto", "cn"]),
  locale: z.string().max(12).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(24),
});

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const access = await requireAiQuota(1);
    if (!access.ok) return access.response;
    const { userId } = access;

    if (!(await isAiConfigured(userId))) {
      return Response.json(
        { error: "AI is not configured", disclaimer: aiDisclaimer("en") },
        { status: 503 },
      );
    }

    const symbol = parsed.data.symbol.toUpperCase();
    const assetType = parseAssetType(parsed.data.assetType);
    const locale = parsed.data.locale || "en";

    return withUserMarket(userId, async () => {
      const tools = createSymbolTools({
        symbol,
        assetType,
        userId,
        locale,
      });

      const messages: ModelMessage[] = parsed.data.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await streamAiText({
        userId,
        system: calmMarketSystemPrompt({
          locale,
          lockedSymbol: symbol,
          lockedAssetType: assetType,
          extra:
            "Prefer calling tools (get_quote, read_chart, get_news, get_earnings, get_existing_trend) before answering factual questions. Keep replies concise.",
        }),
        messages,
        tools,
        stopWhen: stepCountIs(5),
        temperature: 0.4,
      });

      return result.toTextStreamResponse({
        headers: {
          "X-AI-Disclaimer": encodeURIComponent(aiDisclaimer(locale)),
          "X-AI-Symbol": symbol,
        },
      });
    });
  } catch (err) {
    console.error("ai/chat", err);
    const msg =
      err instanceof AiError
        ? err.message
        : err instanceof Error
          ? err.message
          : "chat failed";
    return Response.json({ error: msg }, { status: 502 });
  }
}
