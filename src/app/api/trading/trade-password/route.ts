import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  TRADE_PIN_LENGTH,
  hashTradePin,
  hasTradePassword,
  isValidTradePin,
  verifyTradePin,
} from "@/lib/trading/trade-password";

const setSchema = z.object({
  pin: z.string().regex(new RegExp(`^\\d{${TRADE_PIN_LENGTH}}$`)),
  /** Required when replacing an existing trade password. */
  currentPin: z.string().optional().nullable(),
});

async function requireUser() {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Whether the current user has a trade password configured. */
export async function GET() {
  const userId = await requireUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ enabled: await hasTradePassword(userId) });
}

/** Set or replace the trade password. */
export async function POST(req: Request) {
  const userId = await requireUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = setSchema.safeParse(await req.json());
  if (!parsed.success || !isValidTradePin(parsed.data.pin)) {
    return NextResponse.json({ error: "Invalid pin" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tradePasswordHash: true },
  });

  // Replacing an existing PIN requires the current one.
  if (user?.tradePasswordHash) {
    const current = parsed.data.currentPin;
    if (!current || !(await verifyTradePin(current, user.tradePasswordHash))) {
      return NextResponse.json(
        { error: "Invalid current pin", code: "INVALID_CURRENT_PIN" },
        { status: 400 },
      );
    }
  }

  const tradePasswordHash = await hashTradePin(parsed.data.pin);
  await prisma.user.update({
    where: { id: userId },
    data: { tradePasswordHash },
  });
  return NextResponse.json({ enabled: true });
}

/** Disable the trade password. Requires the current PIN. */
export async function DELETE(req: Request) {
  const userId = await requireUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { pin?: unknown };
  if (typeof body.pin !== "string" || !isValidTradePin(body.pin)) {
    return NextResponse.json({ error: "Invalid pin" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tradePasswordHash: true },
  });
  if (!user?.tradePasswordHash) {
    return NextResponse.json({ enabled: false });
  }
  if (!(await verifyTradePin(body.pin, user.tradePasswordHash))) {
    return NextResponse.json(
      { error: "Invalid pin", code: "INVALID_CURRENT_PIN" },
      { status: 400 },
    );
  }
  await prisma.user.update({
    where: { id: userId },
    data: { tradePasswordHash: null },
  });
  return NextResponse.json({ enabled: false });
}
