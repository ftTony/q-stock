import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { trackConversionEvent } from "@/lib/billing/events";
import {
  appOrigin,
  getStripe,
  isStripeConfigured,
  stripePriceIds,
} from "@/lib/billing/stripe";

const bodySchema = z.object({
  interval: z.enum(["monthly", "yearly"]).default("monthly"),
  locale: z.string().max(12).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error: "Stripe is not configured",
        code: "STRIPE_NOT_CONFIGURED",
        hint: "Use a redeem code in Settings, or configure STRIPE_* env vars.",
      },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe unavailable" }, { status: 503 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const prices = stripePriceIds();
  const priceId =
    parsed.data.interval === "yearly" && prices.yearly
      ? prices.yearly
      : prices.monthly;
  if (!priceId) {
    return NextResponse.json(
      { error: "Price not configured", code: "STRIPE_PRICE_MISSING" },
      { status: 503 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true, email: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const localePrefix =
    parsed.data.locale && parsed.data.locale !== "en"
      ? `/${parsed.data.locale}`
      : "";
  const origin = appOrigin();

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}${localePrefix}/settings?billing=success`,
    cancel_url: `${origin}${localePrefix}/pricing?billing=cancel`,
    client_reference_id: session.user.id,
    metadata: { userId: session.user.id },
    subscription_data: {
      metadata: { userId: session.user.id },
    },
  });

  void trackConversionEvent("checkout_start", {
    userId: session.user.id,
    meta: { interval: parsed.data.interval },
  });

  return NextResponse.json({ url: checkout.url });
}
