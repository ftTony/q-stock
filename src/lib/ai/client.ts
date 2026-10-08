import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, streamText, type ModelMessage } from "ai";
import { z } from "zod";
import { loadUserServiceCreds } from "@/lib/user/service-creds";
import type { AiCreds, AiVendor } from "@/lib/user/service-creds-types";
import type { ZodType } from "zod";

export class AiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "AiError";
  }
}

export type ResolvedAiConfig = {
  vendor: AiVendor;
  apiKey: string;
  model: string;
  baseUrl?: string;
  source: "user" | "env";
};

function envAiConfig(): ResolvedAiConfig | null {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) return null;
  return {
    vendor: "deepseek",
    apiKey,
    model: process.env.DEEPSEEK_MODEL?.trim() || "deepseek-v4-flash",
    baseUrl: process.env.DEEPSEEK_BASE_URL?.trim().replace(/\/+$/, "") || undefined,
    source: "env",
  };
}

export async function resolveAiConfig(
  userId?: string | null,
): Promise<ResolvedAiConfig | null> {
  if (userId) {
    try {
      const store = await loadUserServiceCreds(userId);
      if (store.ai?.apiKey && store.ai.model) {
        return {
          vendor: store.ai.vendor,
          apiKey: store.ai.apiKey,
          model: store.ai.model,
          baseUrl: store.ai.baseUrl,
          source: "user",
        };
      }
    } catch (err) {
      console.error("[ai] load user config failed:", err);
    }
  }
  return envAiConfig();
}

export function isAiConfiguredSync(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY?.trim());
}

/** True if user BYOK or platform env can run AI. */
export async function isAiConfigured(userId?: string | null): Promise<boolean> {
  return Boolean(await resolveAiConfig(userId));
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

export function languageModel(config: ResolvedAiConfig | AiCreds) {
  switch (config.vendor) {
    case "deepseek": {
      const deepseek = createDeepSeek({
        apiKey: config.apiKey,
        ...(config.baseUrl ? { baseURL: config.baseUrl } : {}),
      });
      return deepseek(config.model);
    }
    case "gemini": {
      const google = createGoogleGenerativeAI({
        apiKey: config.apiKey,
        ...(config.baseUrl ? { baseURL: config.baseUrl } : {}),
      });
      return google(config.model);
    }
    case "anthropic": {
      const anthropic = createAnthropic({
        apiKey: config.apiKey,
        ...(config.baseUrl ? { baseURL: config.baseUrl } : {}),
      });
      return anthropic(config.model);
    }
    case "openai":
    case "openai_compat":
    default: {
      const openai = createOpenAI({
        apiKey: config.apiKey,
        ...(config.baseUrl ? { baseURL: config.baseUrl } : {}),
      });
      return openai(config.model);
    }
  }
}

function deepseekOpts(config: ResolvedAiConfig | AiCreds) {
  if (config.vendor !== "deepseek") return {};
  return {
    providerOptions: {
      deepseek: {
        thinking: { type: "disabled" as const },
      },
    },
  };
}

export async function generateAiObject<T>(opts: {
  system: string;
  user: string;
  schema: ZodType<T>;
  temperature?: number;
  config?: ResolvedAiConfig | null;
  userId?: string | null;
  timeoutMs?: number;
}): Promise<T> {
  const config = opts.config ?? (await resolveAiConfig(opts.userId));
  if (!config) {
    throw new AiError("AI is not configured");
  }

  try {
    const { object } = await generateObject({
      model: languageModel(config),
      schema: opts.schema,
      system: opts.system,
      prompt: opts.user,
      temperature: opts.temperature ?? 0.3,
      ...deepseekOpts(config),
      abortSignal: AbortSignal.timeout(opts.timeoutMs ?? 60_000),
    });
    return object as T;
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "AI generateObject failed";
    throw new AiError(msg);
  }
}

export async function generateTrendObject(opts: {
  system: string;
  user: string;
  temperature?: number;
  config?: ResolvedAiConfig | null;
  userId?: string | null;
}): Promise<TrendObject> {
  return generateAiObject({
    ...opts,
    schema: trendSchema,
  });
}

export async function streamAiText(opts: {
  system: string;
  messages: ModelMessage[];
  tools?: Parameters<typeof streamText>[0]["tools"];
  stopWhen?: Parameters<typeof streamText>[0]["stopWhen"];
  temperature?: number;
  config?: ResolvedAiConfig | null;
  userId?: string | null;
}) {
  const config = opts.config ?? (await resolveAiConfig(opts.userId));
  if (!config) {
    throw new AiError("AI is not configured");
  }

  return streamText({
    model: languageModel(config),
    system: opts.system,
    messages: opts.messages,
    tools: opts.tools,
    stopWhen: opts.stopWhen,
    temperature: opts.temperature ?? 0.4,
    ...deepseekOpts(config),
    abortSignal: AbortSignal.timeout(90_000),
  });
}
