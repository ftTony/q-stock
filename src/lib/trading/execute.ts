import type { AccountType, AssetType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { accrueInterest } from "@/lib/trading/account";

type Tx = Prisma.TransactionClient;

export class TradingError extends Error {
  constructor(
    message: string,
    public code: string = "TRADING_ERROR",
  ) {
    super(message);
    this.name = "TradingError";
  }
}

/** Apply a fill inside an existing transaction. Order must already be pending (or newly created). */
export async function applyFillInTx(
  tx: Tx,
  params: {
    orderId: string;
    userId: string;
    accountType: AccountType;
    symbol: string;
    assetType: AssetType;
    side: "buy" | "sell";
    qty: number;
    fillPrice: number;
  },
) {
  const {
    orderId,
    userId,
    accountType,
    symbol,
    assetType,
    side,
    qty,
    fillPrice,
  } = params;
  if (!(qty > 0) || !(fillPrice > 0)) {
    throw new TradingError("Invalid qty or price", "INVALID_FILL");
  }

  const accountWhere = { userId_accountType: { userId, accountType } };
  const account = await tx.paperAccount.findUnique({ where: accountWhere });
  if (!account) {
    throw new TradingError("Account not found", "NO_ACCOUNT");
  }

  // Lazily accrue interest on any outstanding margin debt before settling.
  const interest = await accrueInterest(
    account.accountType,
    Number(account.borrowedBalance),
    Number(account.interestAccrued),
    account.interestAccruedAt,
  );

  const cash = Number(account.cashBalance);
  const borrowed = Number(account.borrowedBalance);
  const notional = qty * fillPrice;

  const posWhere = {
    userId_accountType_symbol_assetType: {
      userId,
      accountType,
      symbol,
      assetType,
    },
  };

  if (side === "buy") {
    // Cash book cannot borrow. Margin book uses cash first, then borrowing.
    if (accountType === "cash" && cash + 1e-8 < notional) {
      throw new TradingError("Insufficient cash", "INSUFFICIENT_CASH");
    }
    const cashUse = Math.min(cash, notional);
    const borrowDelta = Math.max(0, notional - cashUse);
    await tx.paperAccount.update({
      where: accountWhere,
      data: {
        cashBalance: cash - cashUse,
        borrowedBalance: borrowed + borrowDelta,
        interestAccrued: interest.interestAccrued,
        interestAccruedAt: interest.interestAccruedAt,
      },
    });

    const pos = await tx.paperPosition.findUnique({ where: posWhere });
    if (!pos) {
      await tx.paperPosition.create({
        data: {
          userId,
          accountType,
          symbol,
          assetType,
          qty,
          avgCost: fillPrice,
        },
      });
    } else {
      const prevQty = Number(pos.qty);
      const prevCost = Number(pos.avgCost);
      const newQty = prevQty + qty;
      const newAvg = (prevQty * prevCost + notional) / newQty;
      await tx.paperPosition.update({
        where: { id: pos.id },
        data: { qty: newQty, avgCost: newAvg },
      });
    }
  } else {
    const pos = await tx.paperPosition.findUnique({ where: posWhere });
    const held = pos ? Number(pos.qty) : 0;
    if (held + 1e-8 < qty) {
      throw new TradingError("Insufficient position", "INSUFFICIENT_POSITION");
    }
    // Sale proceeds repay margin debt first, remainder returns to cash.
    const repay = Math.min(borrowed, notional);
    await tx.paperAccount.update({
      where: accountWhere,
      data: {
        borrowedBalance: borrowed - repay,
        cashBalance: cash + (notional - repay),
        interestAccrued: interest.interestAccrued,
        interestAccruedAt: interest.interestAccruedAt,
      },
    });
    const remain = held - qty;
    if (remain <= 1e-10) {
      await tx.paperPosition.delete({ where: { id: pos!.id } });
    } else {
      await tx.paperPosition.update({
        where: { id: pos!.id },
        data: { qty: remain },
      });
    }
  }

  return tx.paperOrder.update({
    where: { id: orderId },
    data: {
      status: "filled",
      filledPrice: fillPrice,
      filledAt: new Date(),
    },
  });
}

export async function fillPendingOrder(orderId: string, fillPrice: number) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.paperOrder.findUnique({ where: { id: orderId } });
    if (!order || order.status !== "pending") {
      return null;
    }
    return applyFillInTx(tx, {
      orderId: order.id,
      userId: order.userId,
      accountType: order.accountType,
      symbol: order.symbol,
      assetType: order.assetType,
      side: order.side,
      qty: Number(order.qty),
      fillPrice,
    });
  });
}

export function shouldTriggerPending(params: {
  type: "limit" | "stop" | "market";
  side: "buy" | "sell";
  price: number;
  limitPrice: number | null;
  stopPrice: number | null;
}): boolean {
  const { type, side, price, limitPrice, stopPrice } = params;
  if (type === "limit") {
    if (limitPrice == null) return false;
    return side === "buy" ? price <= limitPrice : price >= limitPrice;
  }
  if (type === "stop") {
    if (stopPrice == null) return false;
    return side === "buy" ? price >= stopPrice : price <= stopPrice;
  }
  return false;
}
