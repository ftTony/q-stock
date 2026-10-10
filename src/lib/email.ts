import crypto from "crypto";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { defaultLocale, localizedPath } from "@/i18n/config";
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

function formatConditionZh(c: "gte" | "lte"): string {
  return c === "gte" ? "高于或等于" : "低于或等于";
}

function formatConditionEn(c: "gte" | "lte"): string {
  return c === "gte" ? "at or above" : "at or below";
}

function assetTypeLabelZh(assetType: string): string {
  if (assetType === "hk") return "港股";
  if (assetType === "crypto") return "数字货币";
  return "美股";
}

function assetTypeLabelEn(assetType: string): string {
  if (assetType === "hk") return "HK stock";
  if (assetType === "crypto") return "Crypto";
  return "US stock";
}

function formatPrice(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  const abs = Math.abs(n);
  const digits = abs >= 1000 ? 2 : abs >= 1 ? 2 : 4;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

function emailBrandLogoHtml(): string {
  /** Dark navy header → logo-dark (light mark readable on dark). */
  const src = `${appBaseUrl()}/logo-dark.png`;
  return `<img src="${src}" alt="钱力股 Q-Stock" width="120" height="106" style="display:block;height:40px;width:auto;max-width:160px;margin:0 0 14px;border:0;outline:none" />`;
}

function emailShell(opts: {
  titleZh: string;
  titleEn: string;
  bodyHtml: string;
}): string {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.65;color:#1a1a1a;max-width:560px;margin:0 auto">
      <div style="padding:28px 24px;border-radius:12px;background:linear-gradient(135deg,#0b1220 0%,#1e3a5f 100%);color:#fff">
        ${emailBrandLogoHtml()}
        <h1 style="margin:0;font-size:22px;font-weight:600">${opts.titleZh}</h1>
        <p style="margin:8px 0 0;opacity:0.9;font-size:14px">${opts.titleEn}</p>
      </div>
      ${opts.bodyHtml}
      <p style="font-size:12px;color:#94a3b8;padding:0 8px 8px;margin:16px 0 0">钱力股 Q-STOCK · 行情与提醒仅供参考，不构成投资建议。<br/>Market data and alerts are for reference only — not investment advice.</p>
    </div>`;
}

function emailBtn(
  href: string,
  label: string,
  kind: "primary" | "ghost" = "primary",
): string {
  if (kind === "ghost") {
    return `<a href="${href}" style="display:inline-block;padding:10px 18px;border-radius:8px;margin-left:8px;border:1px solid #cbd5e1;color:#0f172a;text-decoration:none;font-size:14px">${label}</a>`;
  }
  return `<a href="${href}" style="display:inline-block;padding:10px 18px;border-radius:8px;background:#3b82f6;color:#fff;text-decoration:none;font-size:14px">${label}</a>`;
}

export async function sendAlertEmail(payload: AlertEmailPayload): Promise<void> {
  const base = appBaseUrl();
  const symbol = escapeHtml(payload.symbol);
  const assetZh = assetTypeLabelZh(payload.assetType);
  const assetEn = assetTypeLabelEn(payload.assetType);
  const trigger = formatPrice(payload.triggerPrice);
  const current = formatPrice(payload.currentPrice);
  const cond = formatCondition(payload.condition);
  const when = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
  const symbolUrl = `${base}${localizedPath(defaultLocale, `/symbol/${encodeURIComponent(payload.assetType)}/${encodeURIComponent(payload.symbol)}`)}`;
  const alertsUrl = `${base}${localizedPath(defaultLocale, "/alerts")}`;

  const subject = `[Q-STOCK] ${payload.symbol} 价格提醒已触发 / Price alert triggered`;

  const detailCard = `<div style="margin:16px 0;padding:16px;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#64748b">标的 / Symbol</td><td style="padding:6px 0;text-align:right;font-weight:600">${symbol}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">市场 / Market</td><td style="padding:6px 0;text-align:right">${assetZh} / ${assetEn}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">条件 / Condition</td><td style="padding:6px 0;text-align:right">价格 ${cond} ${trigger}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">现价 / Last</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#0f172a">${current}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">时间 / Time</td><td style="padding:6px 0;text-align:right">${when}</td></tr>
        </table>
      </div>`;

  const html = emailShell({
    titleZh: "价格提醒已触发",
    titleEn: "Price alert triggered",
    bodyHtml: `
      <div style="padding:24px 8px 8px">
        <h2 style="font-size:18px;margin:0 0 12px">提醒通知</h2>
        <p style="margin:0 0 12px">你在 Q-STOCK 设置的价格提醒已满足条件：</p>
        <p style="margin:0 0 8px"><strong>${symbol}</strong>（${assetZh}）现价 <strong>${current}</strong>，已${formatConditionZh(payload.condition)}目标价 <strong>${trigger}</strong>。</p>
        ${detailCard}
        <p style="margin:0 0 20px">
          ${emailBtn(symbolUrl, "查看行情")}
          ${emailBtn(alertsUrl, "管理提醒", "ghost")}
        </p>
        <p style="margin:0;font-size:13px;color:#64748b">该提醒已标记为已触发。如需继续监控，请在「价格提醒」中重新启用或新建提醒。</p>
      </div>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0" />
      <div style="padding:8px 8px 8px">
        <h2 style="font-size:18px;margin:0 0 12px">Alert notice</h2>
        <p style="margin:0 0 12px">A Q-STOCK price alert you set has been triggered:</p>
        <p style="margin:0 0 8px"><strong>${symbol}</strong> (${assetEn}) is now <strong>${current}</strong>, ${formatConditionEn(payload.condition)} your target <strong>${trigger}</strong>.</p>
        <p style="margin:16px 0 20px">
          ${emailBtn(symbolUrl, "View quote")}
          ${emailBtn(alertsUrl, "Manage alerts", "ghost")}
        </p>
        <p style="margin:0;font-size:13px;color:#64748b">This alert is marked as triggered. Re-enable or create a new one in Price Alerts if you want to keep watching.</p>
      </div>`,
  });

  const text = [
    "[Q-STOCK] 价格提醒已触发",
    `${payload.symbol}（${assetZh}）现价 ${current}，条件：价格 ${cond} ${trigger}`,
    `时间：${when}`,
    `查看：${symbolUrl}`,
    `提醒：${alertsUrl}`,
    "",
    "————————",
    "",
    "[Q-STOCK] Price alert triggered",
    `${payload.symbol} (${assetEn}) last ${current}, condition: price ${cond} ${trigger}`,
    `Time: ${when}`,
    `Quote: ${symbolUrl}`,
    `Alerts: ${alertsUrl}`,
  ].join("\n");

  await sendMail(
    { to: payload.to, subject, html, text },
    payload.transport,
  );
}

function localePathFromOpt(locale?: string): string {
  const l = (locale || "").toLowerCase();
  if (l.startsWith("zh-tw") || l.startsWith("zh_tw")) return "zh-TW";
  if (l.startsWith("zh")) return "zh-CN";
  if (l.startsWith("en") || !l) return "en";
  // Other UI locales still map to English public paths for email links
  // unless they match a known prefixed locale.
  if (l === "ja" || l === "fr" || l === "ms" || l === "th" || l === "ko" || l === "de" || l === "es") {
    return l;
  }
  return "en";
}

export async function sendWelcomeEmail(opts: {
  to: string;
  name?: string | null;
  locale?: string;
}): Promise<void> {
  const who = escapeHtml(opts.name?.trim() || opts.to);
  const base = appBaseUrl();
  const localePath = localePathFromOpt(opts.locale);
  const homeUrl = `${base}${localizedPath(localePath)}`;
  const loginUrl = `${base}${localizedPath(localePath, "/login")}`;
  const settingsUrl = `${base}${localizedPath(localePath, "/settings")}`;

  const subject = "欢迎来到钱力股 Q-STOCK / Welcome to Qianli Gu (Q-STOCK)";

  const html = emailShell({
    titleZh: "欢迎来到钱力股平台",
    titleEn: "Welcome to the Qianli Gu platform",
    bodyHtml: `
      <div style="padding:24px 8px 8px">
        <h2 style="font-size:18px;margin:0 0 12px">注册成功</h2>
        <p style="margin:0 0 12px">你好，<strong>${who}</strong>！</p>
        <p style="margin:0 0 12px">感谢注册。你的账户（${escapeHtml(opts.to)}）已就绪，可以开始使用美股 / 港股 / 数字货币行情、自选、价格提醒、AI 分析与模拟交易。</p>
        <p style="margin:0 0 8px"><strong>建议接下来：</strong></p>
        <ol style="margin:0 0 16px;padding-left:20px">
          <li>登录后进入<strong>设置</strong>，选择行情厂商（长桥 / 富途、币安 / OKX）并填写你自己的 API Key（BYOK）。</li>
          <li>可选：配置 AI（DeepSeek / OpenAI / Gemini / Claude）与提醒邮件通道。</li>
          <li>在首页添加自选，或为关注标的设置价格提醒。</li>
        </ol>
        <p style="margin:0 0 20px">
          ${emailBtn(loginUrl, "前往登录")}
          ${emailBtn(settingsUrl, "打开设置", "ghost")}
        </p>
        <p style="margin:0;font-size:13px;color:#64748b">如按钮无法点击，请复制链接：<br/>${loginUrl}</p>
      </div>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0" />
      <div style="padding:8px 8px 8px">
        <h2 style="font-size:18px;margin:0 0 12px">You're in</h2>
        <p style="margin:0 0 12px">Hi <strong>${who}</strong>,</p>
        <p style="margin:0 0 12px">Thanks for joining. Your account (${escapeHtml(opts.to)}) is ready for US / HK equities and crypto quotes, watchlists, price alerts, AI analysis, and paper trading.</p>
        <p style="margin:0 0 8px"><strong>Suggested next steps:</strong></p>
        <ol style="margin:0 0 16px;padding-left:20px">
          <li>Sign in and open <strong>Settings</strong> to pick vendors (Longbridge / Futu, Binance / OKX) and add your own API keys (BYOK).</li>
          <li>Optionally configure AI (DeepSeek / OpenAI / Gemini / Claude) and alert email delivery.</li>
          <li>Build a watchlist or set price alerts on symbols you care about.</li>
        </ol>
        <p style="margin:0 0 20px">
          ${emailBtn(loginUrl, "Sign in")}
          ${emailBtn(settingsUrl, "Open Settings", "ghost")}
        </p>
        <p style="margin:0;font-size:13px;color:#64748b">If the buttons don’t work, copy this link:<br/>${loginUrl}</p>
      </div>`,
  });

  const text = [
    "欢迎来到钱力股 Q-STOCK 平台",
    `你好，${opts.name?.trim() || opts.to}！`,
    `账户已创建：${opts.to}`,
    "",
    "你可以在平台查看美股 / 港股 / 数字货币行情，管理自选、价格提醒、AI 分析与模拟交易。",
    "建议登录后进入「设置」配置行情厂商与 BYOK API Key，并可按需配置 AI 与提醒邮件。",
    `登录：${loginUrl}`,
    `设置：${settingsUrl}`,
    "",
    "————————",
    "",
    "Welcome to Qianli Gu (Q-STOCK)",
    `Hi ${opts.name?.trim() || opts.to},`,
    `Account created: ${opts.to}`,
    "",
    "Use Qianli Gu for US / HK / crypto markets, watchlists, alerts, AI analysis, and paper trading.",
    "After signing in, open Settings to configure vendors and bring-your-own API keys.",
    `Sign in: ${loginUrl}`,
    `Settings: ${settingsUrl}`,
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
  const localePath = localePathFromOpt(opts.locale);
  const resetUrl = `${appBaseUrl()}${localizedPath(localePath, "/reset-password")}?token=${encodeURIComponent(opts.token)}`;
  const loginUrl = `${appBaseUrl()}${localizedPath(localePath, "/login")}`;
  const emailSafe = escapeHtml(opts.to);

  const subject =
    "重置你的 Q-STOCK 密码 / Reset your Q-STOCK password";

  const html = emailShell({
    titleZh: "重置账户密码",
    titleEn: "Reset your account password",
    bodyHtml: `
      <div style="padding:24px 8px 8px">
        <h2 style="font-size:18px;margin:0 0 12px">忘记密码</h2>
        <p style="margin:0 0 12px">我们收到了账户 <strong>${emailSafe}</strong> 的密码重置请求。</p>
        <p style="margin:0 0 12px">请在 <strong>1 小时内</strong> 点击下方按钮设置新密码。链接仅可使用一次。</p>
        <p style="margin:0 0 20px">
          ${emailBtn(resetUrl, "设置新密码")}
          ${emailBtn(loginUrl, "返回登录", "ghost")}
        </p>
        <p style="margin:0 0 12px;font-size:13px;color:#64748b">若按钮无法打开，请复制此链接到浏览器：<br/><span style="word-break:break-all;color:#0f172a">${resetUrl}</span></p>
        <p style="margin:0;font-size:13px;color:#64748b">如果这不是你本人的操作，请忽略本邮件，你的密码不会被更改。</p>
      </div>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0" />
      <div style="padding:8px 8px 8px">
        <h2 style="font-size:18px;margin:0 0 12px">Forgot your password?</h2>
        <p style="margin:0 0 12px">We received a password reset request for <strong>${emailSafe}</strong>.</p>
        <p style="margin:0 0 12px">Use the button below within <strong>1 hour</strong> to choose a new password. The link works only once.</p>
        <p style="margin:0 0 20px">
          ${emailBtn(resetUrl, "Set new password")}
          ${emailBtn(loginUrl, "Back to sign in", "ghost")}
        </p>
        <p style="margin:0 0 12px;font-size:13px;color:#64748b">If the button doesn’t work, paste this URL into your browser:<br/><span style="word-break:break-all;color:#0f172a">${resetUrl}</span></p>
        <p style="margin:0;font-size:13px;color:#64748b">If you didn’t request this, you can ignore this email — your password will stay the same.</p>
      </div>`,
  });

  const text = [
    "重置你的 Q-STOCK 密码",
    `账户：${opts.to}`,
    "请在 1 小时内打开以下链接设置新密码（仅可使用一次）：",
    resetUrl,
    `返回登录：${loginUrl}`,
    "如非本人操作，请忽略本邮件。",
    "",
    "————————",
    "",
    "Reset your Q-STOCK password",
    `Account: ${opts.to}`,
    "Open this link within 1 hour to set a new password (one-time use):",
    resetUrl,
    `Sign in: ${loginUrl}`,
    "If you did not request this, ignore this email.",
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
