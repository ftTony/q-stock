import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_PRICE_PRO_MONTHLY?.trim(),
  );
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key);
  }
  return stripeSingleton;
}

export function stripePriceIds() {
  return {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY?.trim() || "",
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY?.trim() || "",
  };
}

export function appOrigin(): string {
  return (
    process.env.APP_URL?.trim().replace(/\/+$/, "") ||
    process.env.AUTH_URL?.trim().replace(/\/+$/, "") ||
    "http://localhost:3000"
  );
}
