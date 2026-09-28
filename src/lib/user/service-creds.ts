import { prisma } from "@/lib/db";
import { decryptJson } from "@/lib/crypto/secret-box";
import type {
  AiCreds,
  EmailCreds,
  ServiceCredsStatus,
  ServiceCredsStore,
} from "@/lib/user/service-creds-types";

const CACHE_TTL_MS = 60_000;
const cache = new Map<
  string,
  { store: ServiceCredsStore; expiresAt: number }
>();

function serviceCredentialDelegate() {
  const d = prisma.userServiceCredential;
  if (!d) {
    throw new Error(
      "Prisma client missing UserServiceCredential — run `npx prisma generate` and restart the server",
    );
  }
  return d;
}

export function invalidateUserServiceCredsCache(userId: string): void {
  cache.delete(userId);
}

function parseEmail(raw: unknown): EmailCreds | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const channel = String(o.channel ?? "").toLowerCase();
  const from = String(o.from ?? "").trim();
  if (!from) return undefined;
  if (channel === "resend") {
    const resendApiKey = String(o.resendApiKey ?? "").trim();
    if (!resendApiKey) return undefined;
    return { channel: "resend", from, resendApiKey };
  }
  if (channel === "smtp") {
    const smtpHost = String(o.smtpHost ?? "").trim();
    if (!smtpHost) return undefined;
    return {
      channel: "smtp",
      from,
      smtpHost,
      smtpPort: Number(o.smtpPort) || 587,
      smtpUser: String(o.smtpUser ?? "").trim() || undefined,
      smtpPass: String(o.smtpPass ?? "").trim() || undefined,
      smtpSecure: o.smtpSecure === true || o.smtpSecure === "true",
    };
  }
  return undefined;
}

function parseAi(raw: unknown): AiCreds | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const vendor = String(o.vendor ?? "").toLowerCase();
  const apiKey = String(o.apiKey ?? "").trim();
  const model = String(o.model ?? "").trim();
  if (!apiKey || !model) return undefined;
  const allowed = [
    "deepseek",
    "openai",
    "openai_compat",
    "gemini",
    "anthropic",
  ] as const;
  if (!(allowed as readonly string[]).includes(vendor)) {
    return undefined;
  }
  const baseUrl = String(o.baseUrl ?? "").trim().replace(/\/+$/, "") || undefined;
  if (vendor === "openai_compat" && !baseUrl) return undefined;
  return {
    vendor: vendor as AiCreds["vendor"],
    apiKey,
    model,
    baseUrl,
  };
}

export async function loadUserServiceCreds(
  userId: string,
): Promise<ServiceCredsStore> {
  const hit = cache.get(userId);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.store;
  }

  const rows = await serviceCredentialDelegate().findMany({
    where: { userId },
  });

  const store: ServiceCredsStore = { userId };
  for (const row of rows) {
    try {
      const parsed = decryptJson<unknown>(row.payload);
      if (row.provider === "email") {
        store.email = parseEmail(parsed);
      } else if (row.provider === "ai") {
        store.ai = parseAi(parsed);
      }
    } catch (err) {
      console.error(
        `[service-creds] decrypt failed user=${userId} provider=${row.provider}`,
        err,
      );
    }
  }

  cache.set(userId, { store, expiresAt: Date.now() + CACHE_TTL_MS });
  return store;
}

export async function getUserServiceCredsStatus(
  userId: string,
): Promise<ServiceCredsStatus> {
  const store = await loadUserServiceCreds(userId);
  return {
    email: store.email
      ? {
          configured: true,
          channel: store.email.channel,
          from: store.email.from,
        }
      : { configured: false },
    ai: store.ai
      ? {
          configured: true,
          vendor: store.ai.vendor,
          model: store.ai.model,
          baseUrl: store.ai.baseUrl,
        }
      : { configured: false },
  };
}

/** Merge PUT body with existing secrets when blank keep-placeholders are sent. */
export function mergeEmailCreds(
  incoming: Partial<EmailCreds> & { channel: EmailCreds["channel"]; from: string },
  existing?: EmailCreds,
): EmailCreds | null {
  const from = incoming.from.trim();
  if (!from) return null;

  if (incoming.channel === "resend") {
    const key =
      String(incoming.resendApiKey ?? "").trim() ||
      existing?.resendApiKey ||
      "";
    if (!key) return null;
    return { channel: "resend", from, resendApiKey: key };
  }

  const smtpHost =
    String(incoming.smtpHost ?? "").trim() || existing?.smtpHost || "";
  if (!smtpHost) return null;
  const smtpPass =
    String(incoming.smtpPass ?? "").trim() || existing?.smtpPass || undefined;
  return {
    channel: "smtp",
    from,
    smtpHost,
    smtpPort: incoming.smtpPort ?? existing?.smtpPort ?? 587,
    smtpUser:
      String(incoming.smtpUser ?? "").trim() || existing?.smtpUser || undefined,
    smtpPass,
    smtpSecure: incoming.smtpSecure ?? existing?.smtpSecure ?? false,
  };
}

export function mergeAiCreds(
  incoming: Partial<AiCreds> & {
    vendor: AiCreds["vendor"];
    model: string;
  },
  existing?: AiCreds,
): AiCreds | null {
  const model = incoming.model.trim();
  if (!model) return null;
  const apiKey =
    String(incoming.apiKey ?? "").trim() || existing?.apiKey || "";
  if (!apiKey) return null;
  const baseUrl =
    String(incoming.baseUrl ?? "").trim().replace(/\/+$/, "") ||
    (incoming.vendor === existing?.vendor ? existing?.baseUrl : undefined);
  if (incoming.vendor === "openai_compat" && !baseUrl) return null;
  return {
    vendor: incoming.vendor,
    apiKey,
    model,
    baseUrl: incoming.vendor === "openai" ? undefined : baseUrl,
  };
}
