import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateObject } from "ai";
import { z } from "zod";

export class AiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "AiError";
  }
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY?.trim());
}

function modelId(): string {
  return process.env.DEEPSEEK_MODEL?.trim() || "deepseek-v4-flash";
}

const trendSchema = z.object({
  bias: z.enum(["bullish", "neutral", "bearish"]),
  confidence: z.number().min(0).max(1),
  horizon: z.enum(["short", "medium"]),
  summary: z.string().min(1),
  drivers: z.array(z.string()).min(1).max(8),
  risks: z.array(z.string()).min(1).max(8),
});

export type TrendObject = z.infer<typeof trendSchema>;

export async function generateTrendObject(opts: {
  system: string;
  user: string;
  temperature?: number;
}): Promise<TrendObject> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    throw new AiError("DEEPSEEK_API_KEY is not configured");
  }

  const deepseek = createDeepSeek({
    apiKey,
    ...(process.env.DEEPSEEK_BASE_URL?.trim()
      ? { baseURL: process.env.DEEPSEEK_BASE_URL.trim().replace(/\/+$/, "") }
      : {}),
  });

  try {
    const { object } = await generateObject({
      model: deepseek(modelId()),
      schema: trendSchema,
      system: opts.system,
      prompt: opts.user,
      temperature: opts.temperature ?? 0.3,
      providerOptions: {
        deepseek: {
          // Structured JSON is more reliable with thinking off on V4 models
          thinking: { type: "disabled" },
        },
      },
      abortSignal: AbortSignal.timeout(60_000),
    });
    return object;
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "DeepSeek generateObject failed";
    throw new AiError(msg);
  }
}
