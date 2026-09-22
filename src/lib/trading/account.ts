import { prisma } from "@/lib/db";

export const INITIAL_CASH = 100_000;

export async function ensureAccount(userId: string) {
  return prisma.paperAccount.upsert({
    where: { userId },
    create: {
      userId,
      cashBalance: INITIAL_CASH,
      currency: "USD",
    },
    update: {},
  });
}

export async function resetAccount(userId: string) {
  await ensureAccount(userId);
  await prisma.$transaction([
    prisma.paperOrder.deleteMany({ where: { userId } }),
    prisma.paperPosition.deleteMany({ where: { userId } }),
    prisma.paperAccount.update({
      where: { userId },
      data: { cashBalance: INITIAL_CASH },
    }),
  ]);
  return ensureAccount(userId);
}

export function serializeAccount(account: {
  id: string;
  userId: string;
  cashBalance: { toString(): string } | number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: account.id,
    userId: account.userId,
    cashBalance: Number(account.cashBalance),
    currency: account.currency,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}
