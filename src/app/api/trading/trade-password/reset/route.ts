import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  TRADE_PIN_LENGTH,
  hashTradePin,
  isValidTradePin,
} from "@/lib/trading/trade-password";

const resetSchema = z.object({
  /** Login password — proves identity when the trade PIN is forgotten. */
  loginPassword: z.string().min(1),
  pin: z.string().regex(new RegExp(`^\\d{${TRADE_PIN_LENGTH}}$`)),
});

/**
 * Reset a forgotten trade password by verifying the account login password.
 * Only reachable in an authenticated session — the login password is the
 * stronger credential, mirroring how brokers allow PIN resets after login.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = resetSchema.safeParse(await req.json());
  if (!parsed.success || !isValidTradePin(parsed.data.pin)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) {
    // OAuth-only account has no login password to verify against.
    return NextResponse.json(
      { error: "No login password", code: "NO_LOGIN_PASSWORD" },
      { status: 400 },
    );
  }
  const ok = await bcrypt.compare(parsed.data.loginPassword, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Invalid login password", code: "INVALID_LOGIN_PASSWORD" },
      { status: 401 },
    );
  }

  const tradePasswordHash = await hashTradePin(parsed.data.pin);
  await prisma.user.update({
    where: { id: userId },
    data: { tradePasswordHash },
  });
  return NextResponse.json({ enabled: true });
}
