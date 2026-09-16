import nodemailer from "nodemailer";
import { Resend } from "resend";

export interface AlertEmailPayload {
  to: string;
  symbol: string;
  assetType: string;
  condition: "gte" | "lte";
  triggerPrice: number;
  currentPrice: number;
}

function formatCondition(c: "gte" | "lte"): string {
  return c === "gte" ? "≥" : "≤";
}

function buildHtml(p: AlertEmailPayload): string {
  return `
  <div style="font-family:sans-serif;line-height:1.5">
    <h2>Price Alert Triggered</h2>
    <p><strong>${p.symbol}</strong> (${p.assetType}) reached your target.</p>
    <ul>
      <li>Condition: price ${formatCondition(p.condition)} ${p.triggerPrice}</li>
      <li>Current price: ${p.currentPrice}</li>
      <li>Time: ${new Date().toISOString()}</li>
    </ul>
  </div>`;
}

export async function sendAlertEmail(payload: AlertEmailPayload): Promise<void> {
  const from = process.env.EMAIL_FROM || "alerts@example.com";
  const subject = `[Q-Stock] ${payload.symbol} alert ${formatCondition(payload.condition)} ${payload.triggerPrice}`;
  const html = buildHtml(payload);
  const text = `${payload.symbol} ${formatCondition(payload.condition)} ${payload.triggerPrice}, current ${payload.currentPrice}`;

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from,
      to: payload.to,
      subject,
      html,
      text,
    });
    if (error) throw new Error(error.message);
    return;
  }

  const host = process.env.SMTP_HOST;
  if (!host) {
    console.warn("[email] No RESEND_API_KEY or SMTP_HOST; logging alert only");
    console.info("[email]", { to: payload.to, subject, text });
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });

  await transporter.sendMail({
    from,
    to: payload.to,
    subject,
    html,
    text,
  });
}
