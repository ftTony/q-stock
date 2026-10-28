import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { appOrigin, getStripe, isStripeConfigured } from "@/lib/billing/stripe";

const bodySchema = z.object({
  locale: z.string().max(12).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured", code: "STRIPE_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe unavailable" }, { status: 503 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });
  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing customer", code: "NO_CUSTOMER" },
      { status: 400 },
    );
  }

  const localePrefix =
    parsed.success && parsed.data.locale && parsed.data.locale !== "en"
      ? `/${parsed.data.locale}`
      : "";

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appOrigin()}${localePrefix}/settings`,
  });

  return NextResponse.json({ url: portal.url });
}
