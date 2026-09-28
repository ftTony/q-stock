export type EmailChannel = "resend" | "smtp";

export type EmailCreds = {
  channel: EmailChannel;
  from: string;
  resendApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpSecure?: boolean;
};

export type AiVendor =
  | "deepseek"
  | "openai"
  | "openai_compat"
  | "gemini"
  | "anthropic";

export type AiCreds = {
  vendor: AiVendor;
  apiKey: string;
  model: string;
  baseUrl?: string;
};

export type ServiceCredsStore = {
  userId?: string;
  email?: EmailCreds;
  ai?: AiCreds;
};

export type EmailCredsStatus = {
  configured: boolean;
  channel?: EmailChannel;
  from?: string;
};

export type AiCredsStatus = {
  configured: boolean;
  vendor?: AiVendor;
  model?: string;
  baseUrl?: string;
};

export type ServiceCredsStatus = {
  email: EmailCredsStatus;
  ai: AiCredsStatus;
};

export const DEEPSEEK_MODELS = [
  "deepseek-v4-flash",
  "deepseek-chat",
  "deepseek-reasoner",
] as const;

export const OPENAI_MODELS = [
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4.1-mini",
  "gpt-4.1",
] as const;

export const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-1.5-pro",
] as const;

export const ANTHROPIC_MODELS = [
  "claude-opus-4-20250514",
  "claude-opus-4-1-20250805",
  "claude-sonnet-4-20250514",
  "claude-3-5-haiku-latest",
] as const;

export function presetModelsForVendor(vendor: AiVendor): readonly string[] {
  switch (vendor) {
    case "deepseek":
      return DEEPSEEK_MODELS;
    case "openai":
      return OPENAI_MODELS;
    case "gemini":
      return GEMINI_MODELS;
    case "anthropic":
      return ANTHROPIC_MODELS;
    default:
      return [];
  }
}
