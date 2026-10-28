/** VAPID config for Web Push. Missing keys → push disabled. */

export function getVapidPublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  return key || null;
}

export function getVapidPrivateKey(): string | null {
  const key = process.env.VAPID_PRIVATE_KEY?.trim();
  return key || null;
}

export function getVapidSubject(): string {
  const sub = process.env.VAPID_SUBJECT?.trim();
  if (sub) return sub;
  const from = process.env.EMAIL_FROM?.trim();
  if (from?.includes("@")) {
    const m = from.match(/[\w.+-]+@[\w.-]+/);
    if (m) return `mailto:${m[0]}`;
  }
  return "mailto:support@example.com";
}

export function isPushConfigured(): boolean {
  return Boolean(getVapidPublicKey() && getVapidPrivateKey());
}
