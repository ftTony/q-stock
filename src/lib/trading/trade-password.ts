import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

/** Trade PIN is a 6-digit numeric code. */
export const TRADE_PIN_LENGTH = 6;
const SALT_ROUNDS = 10;

export function isValidTradePin(pin: string): boolean {
  return new RegExp(`^\\d{${TRADE_PIN_LENGTH}}$`).test(pin);
}

export async function hashTradePin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

export async function verifyTradePin(
  pin: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

/** Returns whether the user has configured a trade password. */
export async function hasTradePassword(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tradePasswordHash: true },
  });
  return Boolean(user?.tradePasswordHash);
}

/**
 * Verify a submitted trade PIN against the stored hash.
 * - No password configured → allowed (feature is opt-in).
 * - Password configured but PIN missing/wrong → throws with a stable code.
 */
export async function assertTradePassword(
  userId: string,
  pin: string | null | undefined,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tradePasswordHash: true },
  });
  if (!user?.tradePasswordHash) return;
  if (!pin || !(await verifyTradePin(pin, user.tradePasswordHash))) {
    const { TradingError } = await import("@/lib/trading/execute");
    throw new TradingError("Invalid trade password", "INVALID_TRADE_PASSWORD");
  }
}

/**
 * Read the trade PIN from the `x-trade-pin` header, falling back to a body field.
 *
 * Every trading/account **write** route funnels through this so the PIN can be
 * supplied uniformly: DELETE (cancel) has no body, while POST/PATCH already
 * carry one. When the user has no trade password configured, verification is
 * a no-op, so these routes stay usable for the opt-out flow.
 */
export async function assertTradePasswordFromRequest(
  req: Request,
  userId: string,
  bodyPin?: string | null,
): Promise<void> {
  const headerPin = req.headers.get("x-trade-pin");
  await assertTradePassword(userId, headerPin || bodyPin);
}
