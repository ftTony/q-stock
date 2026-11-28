import type { AccountType } from "@prisma/client";
import { prisma } from "@/lib/db";

export const INITIAL_CASH = 100_000;
/** Margin accounts can hold up to 2× their equity in gross exposure. */
export const MARGIN_LEVERAGE = 2;
/** Annual interest rate charged on outstanding margin borrowing. */
export const MARGIN_INTEREST_APR = 0.08;

export const ACCOUNT_TYPES: AccountType[] = ["cash", "margin"];

type Decimalish = { toString(): string } | number;
const num = (v: Decimalish) => Number(v);

export async function ensureAccount(
  userId: string,
  accountType: AccountType = "cash",
) {
  return prisma.paperAccount.upsert({
    where: { userId_accountType: { userId, accountType } },
    create: {
      userId,
      accountType,
      cashBalance: INITIAL_CASH,
      currency: "USD",
      ...(accountType === "margin"
        ? { interestAccruedAt: new Date() }
        : {}),
    },
    update: {},
  });
}

/** Ensure both cash and margin books exist for a user. */
export async function ensureAccounts(userId: string) {
  const [cash, margin] = await Promise.all([
    ensureAccount(userId, "cash"),
    ensureAccount(userId, "margin"),
  ]);
  return { cash, margin };
}

export async function resetAccount(
  userId: string,
  accountType: AccountType = "cash",
) {
  await ensureAccount(userId, accountType);
  await prisma.$transaction([
    prisma.paperOrder.deleteMany({ where: { userId, accountType } }),
    prisma.paperPosition.deleteMany({ where: { userId, accountType } }),
    prisma.paperAccount.update({
      where: { userId_accountType: { userId, accountType } },
      data: {
        cashBalance: INITIAL_CASH,
        borrowedBalance: 0,
        interestAccrued: 0,
        interestAccruedAt: accountType === "margin" ? new Date() : null,
        dayStartEquity: null,
        dayStartDate: null,
      },
    }),
  ]);
  return ensureAccount(userId, accountType);
}

/** Accrue daily interest on outstanding margin debt. No-op for cash accounts
 * or when no borrowing exists. Call inside the caller's transaction/flow. */
export async function accrueInterest(
  accountType: AccountType,
  borrowed: number,
  interestAccrued: number,
  interestAccruedAt: Date | null,
): Promise<{ interestAccrued: number; interestAccruedAt: Date | null }> {
  if (accountType !== "margin" || borrowed <= 0) {
    return { interestAccrued, interestAccruedAt };
  }
  const now = new Date();
  const base = interestAccruedAt ?? now;
  const days = Math.max(0, (now.getTime() - base.getTime()) / 86_400_000);
  if (days <= 0) return { interestAccrued, interestAccruedAt };
  return {
    interestAccrued: interestAccrued + borrowed * MARGIN_INTEREST_APR * (days / 365),
    interestAccruedAt: now,
  };
}

/** Refresh interest on a margin account and persist it. Best-effort: a failed
 * accrual must never block an account read. */
export async function refreshAccountInterest(
  account: Awaited<ReturnType<typeof ensureAccount>>,
) {
  const borrowed = num(account.borrowedBalance);
  const accrued = await accrueInterest(
    account.accountType,
    borrowed,
    num(account.interestAccrued),
    account.interestAccruedAt,
  );
  if (
    accrued.interestAccrued === num(account.interestAccrued) &&
    accrued.interestAccruedAt === account.interestAccruedAt
  ) {
    return account;
  }
  return prisma.paperAccount.update({
    where: { id: account.id },
    data: {
      interestAccrued: accrued.interestAccrued,
      interestAccruedAt: accrued.interestAccruedAt,
    },
  });
}

export function serializeAccount(account: {
  id: string;
  userId: string;
  accountType: AccountType;
  cashBalance: Decimalish;
  currency: string;
  borrowedBalance?: Decimalish;
  interestAccrued?: Decimalish;
  interestAccruedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: account.id,
    userId: account.userId,
    accountType: account.accountType,
    cashBalance: num(account.cashBalance),
    currency: account.currency,
    borrowedBalance: num(account.borrowedBalance ?? 0),
    interestAccrued: num(account.interestAccrued ?? 0),
    interestAccruedAt: account.interestAccruedAt?.toISOString() ?? null,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}
