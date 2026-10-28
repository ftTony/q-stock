import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { trackConversionEvent } from "@/lib/billing/events";
import { grantProPlan, revokeProPlan } from "@/lib/billing/grant-pro";
import { getStripe } from "@/lib/billing/stripe";

export const runtime = "nodejs";

async function resolveUserId(
  customerId: string | null | undefined,
  metadataUserId?: string | null,
): Promise<string | null> {
  if (metadataUserId) return metadataUserId;
  if (!customerId) return null;
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });
  return user?.id ?? null;
}

function periodEndToExpiry(sub: Stripe.Subscription): Date {
  const raw = sub as Stripe.Subscription & {
    current_period_end?: number;
  };
  const end =
    raw.current_period_end ??
    sub.items?.data?.[0]?.current_period_end ??
    sub.ended_at;
  if (typeof end === "number") return new Date(end * 1000);
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const raw = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("[billing] webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;
        const userId = await resolveUserId(
          typeof session.customer === "string" ? session.customer : null,
          session.metadata?.userId ?? session.client_reference_id,
        );
        if (!userId) break;

        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const expiry = periodEndToExpiry(sub);
          const days = Math.max(
            1,
            Math.ceil((expiry.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
          );
          await grantProPlan(userId, {
            days,
            expiresAt: expiry,
            source: "stripe_checkout",
            note: subId,
            stripeCustomerId:
              typeof session.customer === "string" ? session.customer : null,
            stripeSubscriptionId: subId,
          });
        } else {
          await grantProPlan(userId, {
            days: 31,
            source: "stripe_checkout",
            stripeCustomerId:
              typeof session.customer === "string" ? session.customer : null,
          });
        }
        void trackConversionEvent("checkout_success", { userId });
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(
          typeof sub.customer === "string" ? sub.customer : null,
          sub.metadata?.userId,
        );
        if (!userId) break;
        if (sub.status === "active" || sub.status === "trialing") {
          const expiry = periodEndToExpiry(sub);
          const days = Math.max(
            1,
            Math.ceil((expiry.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
          );
          await grantProPlan(userId, {
            days,
            expiresAt: expiry,
            source: "stripe_subscription_updated",
            note: sub.id,
            stripeSubscriptionId: sub.id,
            stripeCustomerId:
              typeof sub.customer === "string" ? sub.customer : null,
          });
        } else if (
          sub.status === "canceled" ||
          sub.status === "unpaid" ||
          sub.status === "incomplete_expired"
        ) {
          await revokeProPlan(userId, {
            source: "stripe_subscription_ended",
            note: sub.status,
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(
          typeof sub.customer === "string" ? sub.customer : null,
          sub.metadata?.userId,
        );
        if (!userId) break;
        await revokeProPlan(userId, {
          source: "stripe_subscription_deleted",
          note: sub.id,
        });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[billing] webhook handler failed:", event.type, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
