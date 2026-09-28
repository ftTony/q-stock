import crypto from "crypto";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { loadUserServiceCreds } from "@/lib/user/service-creds";
import type { EmailCreds } from "@/lib/user/service-creds-types";

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/** Resolved transport for outbound mail (user BYOK or platform env). */
export type MailTransport =
  | { kind: "resend"; from: string; apiKey: string }
  | {
      kind: "smtp";
      from: string;
      host: string;
      port: number;
      user?: string;
      pass?: string;
      secure: boolean;
    }
  | { kind: "log"; from: string };

function appBaseUrl(): string {
  return (
    process.env.APP_URL?.replace(/\/+$/, "") ||
    process.env.NEXTAUTH_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000"
  );
}

function envMailTransport(): MailTransport {
  const from = process.env.EMAIL_FROM || "alerts@example.com";
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    return { kind: "resend", from, apiKey: resendKey };
  }
  const host = process.env.SMTP_HOST?.trim();
  if (host) {
    return {
      kind: "smtp",
      from,
      host,
      port: Number(process.env.SMTP_PORT || 587),
      user: process.env.SMTP_USER?.trim() || undefined,
      pass: process.env.SMTP_PASS?.trim() || undefined,
      secure: process.env.SMTP_SECURE === "true",
    };
  }
  return { kind: "log", from };
}

function emailCredsToTransport(creds: EmailCreds): MailTransport | null {
  if (creds.channel === "resend") {
    if (!creds.resendApiKey) return null;
    return {
      kind: "resend",
      from: creds.from,
      apiKey: creds.resendApiKey,
    };
  }
  if (!creds.smtpHost) return null;
  return {
    kind: "smtp",
    from: creds.from,
    host: creds.smtpHost,
    port: creds.smtpPort ?? 587,
    user: creds.smtpUser,
    pass: creds.smtpPass,
    secure: Boolean(creds.smtpSecure),
  };
}

/** Platform env only — used for welcome / password-reset. */
export function platformMailTransport(): MailTransport {
  return envMailTransport();
}

/** User BYOK first, then platform env (alerts). */
export async function resolveAlertMailTransport(
  userId: string,
): Promise<MailTransport> {
  try {
    const store = await loadUserServiceCreds(userId);
    if (store.email) {
      const t = emailCredsToTransport(store.email);
      if (t) return t;
    }
  } catch (err) {
    console.error("[email] load user transport failed:", err);
  }
  return envMailTransport();
}

/** Low-level send via explicit transport (or platform env if omitted). */
export async function sendMail(
  input: SendMailInput,
  transport?: MailTransport,
): Promise<void> {
  const t = transport ?? envMailTransport();

  if (t.kind === "resend") {
    const resend = new Resend(t.apiKey);
    const { error } = await resend.emails.send({
      from: t.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    if (error) throw new Error(error.message);
    return;
  }

  if (t.kind === "smtp") {
    const transporter = nodemailer.createTransport({
      host: t.host,
      port: t.port,
      secure: t.secure,
      auth: t.user && t.pass ? { user: t.user, pass: t.pass } : undefined,
    });
    await transporter.sendMail({
      from: t.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    return;
  }

  console.warn("[email] No RESEND_API_KEY or SMTP_HOST; logging only");
  console.info("[email]", {
    to: input.to,
    subject: input.subject,
    text: input.text,
  });
}

export interface AlertEmailPayload {
  to: string;
  symbol: string;
  assetType: string;
  condition: "gte" | "lte";
  triggerPrice: number;
  currentPrice: number;
  transport?: MailTransport;
}

function formatCondition(c: "gte" | "lte"): string {
  return c === "gte" ? "≥" : "≤";
}

export async function sendAlertEmail(payload: AlertEmailPayload): Promise<void> {
  const subject = `[Q-Stock] ${payload.symbol} alert ${formatCondition(payload.condition)} ${payload.triggerPrice}`;
  const html = `
  <div style="font-family:sans-serif;line-height:1.5">
    <h2>Price Alert Triggered</h2>
    <p><strong>${payload.symbol}</strong> (${payload.assetType}) reached your target.</p>
    <ul>
      <li>Condition: price ${formatCondition(payload.condition)} ${payload.triggerPrice}</li>
      <li>Current price: ${payload.currentPrice}</li>
      <li>Time: ${new Date().toISOString()}</li>
    </ul>
  </div>`;
  const text = `${payload.symbol} ${formatCondition(payload.condition)} ${payload.triggerPrice}, current ${payload.currentPrice}`;
  await sendMail(
    { to: payload.to, subject, html, text },
    payload.transport,
  );
}

function localePathFromOpt(locale?: string): string {
  const l = (locale || "").toLowerCase();
  if (l.startsWith("zh-tw") || l.startsWith("zh_tw")) return "zh-TW";
  if (l.startsWith("en")) return "en";
  return "zh-CN";
}

export async function sendWelcomeEmail(opts: {
  to: string;
  name?: string | null;
  locale?: string;
}): Promise<void> {
  const who = escapeHtml(opts.name?.trim() || opts.to);
  const loginUrl = `${appBaseUrl()}/${localePathFromOpt(opts.locale)}/login`;
  const subject = "欢迎加入 Q-Stock / Welcome to Q-Stock";
  const html = `<div style="font-family:sans-serif;line-height:1.6">
      <h2>注册成功</h2>
      <p>你好，${who}！</p>
      <p>你的 Q-Stock 账户已创建。可在设置中配置长桥 / 富途 / 币安 / OKX 行情 Key。</p>
      <p><a href="${loginUrl}">前往登录</a></p>
      <hr style="border:none;border-top:1px solid #ddd;margin:24px 0" />
      <h2>You're in</h2>
      <p>Hi ${who},</p>
      <p>Your Q-Stock account is ready. Configure Longbridge / Futu / Binance / OKX keys in Settings.</p>
      <p><a href="${loginUrl}">Sign in</a></p>
    </div>`;
  const text = [
    `欢迎加入 Q-Stock。账户已创建：${opts.to}`,
    `登录：${loginUrl}`,
    "",
    `Welcome to Q-Stock. Account created: ${opts.to}`,
    `Sign in: ${loginUrl}`,
  ].join("\n");
  await sendMail(
    { to: opts.to, subject, html, text },
    platformMailTransport(),
  );
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  token: string;
  locale?: string;
}): Promise<void> {
  const resetUrl = `${appBaseUrl()}/${localePathFromOpt(opts.locale)}/reset-password?token=${encodeURIComponent(opts.token)}`;
  const subject = "重置你的 Q-Stock 密码 / Reset your Q-Stock password";
  const html = `<div style="font-family:sans-serif;line-height:1.6">
      <h2>重置密码</h2>
      <p>请在 1 小时内点击下方链接设置新密码：</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>如非本人操作，请忽略本邮件。</p>
      <hr style="border:none;border-top:1px solid #ddd;margin:24px 0" />
      <h2>Reset password</h2>
      <p>Use this link within 1 hour to set a new password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, ignore this email.</p>
    </div>`;
  const text = [
    `重置密码链接（1 小时内有效）：${resetUrl}`,
    "",
    `Password reset link (valid 1 hour): ${resetUrl}`,
  ].join("\n");
  await sendMail(
    { to: opts.to, subject, html, text },
    platformMailTransport(),
  );
}

export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
