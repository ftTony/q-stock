import type {
  AccountType,
  AssetType,
  OrderSide,
  OrderType,
  PaperOrder,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { getQuote } from "@/lib/market";
import { withUserMarket } from "@/lib/market/with-user-market";
import { normalizeSymbol } from "@/lib/types";
import { accrueInterest, ensureAccount } from "@/lib/trading/account";
import { assertPaperRisk } from "@/lib/trading/assert-paper-risk";
import { accountMetrics } from "@/lib/trading/margin";
import { TradingError, applyFillInTx, fillPendingOrder, shouldTriggerPending } from "@/lib/trading/execute";

export type PlaceOrderInput = {
  userId: string;
  accountType: AccountType;
  symbol: string;
  assetType: AssetType;
  side: OrderSide;
  type: OrderType;
  qty: number;
  limitPrice?: number | null;
  stopPrice?: number | null;
  emotionTags?: string[];
  invalidationNote?: string | null;
  strategyId?: string | null;
  riskSnapshot?: Record<string, unknown> | null;
};

export function serializeOrder(order: PaperOrder) {
  return {
    id: order.id,
    userId: order.userId,
    accountType: order.accountType,
    symbol: order.symbol,
    assetType: order.assetType,
    side: order.side,
    type: order.type,
    qty: Number(order.qty),
    limitPrice: order.limitPrice != null ? Number(order.limitPrice) : null,
    stopPrice: order.stopPrice != null ? Number(order.stopPrice) : null,
    status: order.status,
    filledPrice: order.filledPrice != null ? Number(order.filledPrice) : null,
    filledAt: order.filledAt ? order.filledAt.toISOString() : null,
    rejectReason: order.rejectReason,
    emotionTags: order.emotionTags ?? [],
    invalidationNote: order.invalidationNote ?? null,
    strategyId: order.strategyId ?? null,
    riskSnapshot: order.riskSnapshot ?? null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

/** Current buying power for an account inside a transaction. */
async function buyingPowerInTx(
  tx: Prisma.TransactionClient,
  userId: string,
  accountType: AccountType,
) {
  const account = await tx.paperAccount.findUniqueOrThrow({
    where: { userId_accountType: { userId, accountType } },
  });
  const positions = await tx.paperPosition.findMany({
    where: { userId, accountType },
  });
  const gross = positions.reduce(
    (s, p) => s + Number(p.qty) * Number(p.avgCost),
    0,
  );
  const interest = await accrueInterest(
    account.accountType,
    Number(account.borrowedBalance),
    Number(account.interestAccrued),
    account.interestAccruedAt,
  );
  return accountMetrics({
    accountType,
    cash: Number(account.cashBalance),
    gross,
    borrowed: Number(account.borrowedBalance),
    interest: interest.interestAccrued,
  });
}

function orderMeta(input: PlaceOrderInput): {
  emotionTags: string[];
  invalidationNote: string | null;
  strategyId: string | null;
  riskSnapshot?: Prisma.InputJsonValue;
} {
  return {
    emotionTags: input.emotionTags ?? [],
    invalidationNote: input.invalidationNote ?? null,
    strategyId: input.strategyId ?? null,
    riskSnapshot:
      input.riskSnapshot != null
        ? (input.riskSnapshot as Prisma.InputJsonValue)
        : undefined,
  };
}

export async function placeOrder(input: PlaceOrderInput) {
  return withUserMarket(input.userId, () => placeOrderInner(input));
}

async function placeOrderInner(input: PlaceOrderInput) {
  const symbol = normalizeSymbol(input.symbol, input.assetType);
  const qty = input.qty;

  if (!(qty > 0) || !Number.isFinite(qty)) {
    throw new TradingError("Invalid quantity", "INVALID_QTY");
  }
  if (input.type === "limit") {
    if (!(input.limitPrice && input.limitPrice > 0)) {
      throw new TradingError("limitPrice required", "INVALID_LIMIT");
    }
  }
  if (input.type === "stop") {
    if (!(input.stopPrice && input.stopPrice > 0)) {
      throw new TradingError("stopPrice required", "INVALID_STOP");
    }
  }

  await ensureAccount(input.userId, input.accountType);
  await assertPaperRisk({
    userId: input.userId,
    accountType: input.accountType,
    symbol,
    assetType: input.assetType,
    side: input.side,
    qty,
    type: input.type,
    limitPrice: input.limitPrice,
    stopPrice: input.stopPrice,
    emotionTags: input.emotionTags,
  });

  if (input.type === "market") {
    const quote = await getQuote(symbol, input.assetType);
    const fillPrice = quote.price;
    if (!(fillPrice > 0)) {
      throw new TradingError("Invalid market price", "NO_QUOTE");
    }

    return prisma.$transaction(async (tx) => {
      if (input.side === "buy") {
        const { buyingPower } = await buyingPowerInTx(
          tx,
          input.userId,
          input.accountType,
        );
        if (buyingPower + 1e-8 < qty * fillPrice) {
          throw new TradingError("Insufficient cash", "INSUFFICIENT_CASH");
        }
      } else {
        const pos = await tx.paperPosition.findUnique({
          where: {
            userId_accountType_symbol_assetType: {
              userId: input.userId,
              accountType: input.accountType,
              symbol,
              assetType: input.assetType,
            },
          },
        });
        const held = pos ? Number(pos.qty) : 0;
        if (held + 1e-8 < qty) {
          throw new TradingError("Insufficient position", "INSUFFICIENT_POSITION");
        }
      }

      const order = await tx.paperOrder.create({
        data: {
          userId: input.userId,
          accountType: input.accountType,
          symbol,
          assetType: input.assetType,
          side: input.side,
          type: "market",
          qty,
          status: "pending",
          ...orderMeta(input),
        },
      });

      return applyFillInTx(tx, {
        orderId: order.id,
        userId: input.userId,
        accountType: input.accountType,
        symbol,
        assetType: input.assetType,
        side: input.side,
        qty,
        fillPrice,
      });
    });
  }

  // Limit / stop: validate then park as pending (fill immediately if already triggered)
  const order = await prisma.$transaction(async (tx) => {
    if (input.side === "buy") {
      const { buyingPower } = await buyingPowerInTx(
        tx,
        input.userId,
        input.accountType,
      );
      const reservePrice =
        input.type === "limit"
          ? Number(input.limitPrice)
          : Number(input.stopPrice);
      if (buyingPower + 1e-8 < qty * reservePrice) {
        throw new TradingError("Insufficient cash", "INSUFFICIENT_CASH");
      }
    } else {
      const pos = await tx.paperPosition.findUnique({
        where: {
          userId_accountType_symbol_assetType: {
            userId: input.userId,
            accountType: input.accountType,
            symbol,
            assetType: input.assetType,
          },
        },
      });
      const held = pos ? Number(pos.qty) : 0;
      const pendingSells = await tx.paperOrder.findMany({
        where: {
          userId: input.userId,
          accountType: input.accountType,
          symbol,
          assetType: input.assetType,
          side: "sell",
          status: "pending",
        },
      });
      const reserved = pendingSells.reduce((s, o) => s + Number(o.qty), 0);
      if (held - reserved + 1e-8 < qty) {
        throw new TradingError("Insufficient position", "INSUFFICIENT_POSITION");
      }
    }

    return tx.paperOrder.create({
      data: {
        userId: input.userId,
        accountType: input.accountType,
        symbol,
        assetType: input.assetType,
        side: input.side,
        type: input.type,
        qty,
        limitPrice: input.type === "limit" ? input.limitPrice! : null,
        stopPrice: input.type === "stop" ? input.stopPrice! : null,
        status: "pending",
        ...orderMeta(input),
      },
    });
  });

  try {
    const quote = await getQuote(symbol, input.assetType);
    const price = quote.price;
    if (
      price > 0 &&
      shouldTriggerPending({
        type: input.type,
        side: input.side,
        price,
        limitPrice: input.limitPrice ?? null,
        stopPrice: input.stopPrice ?? null,
      })
    ) {
      const filled = await fillPendingOrder(order.id, price);
      if (filled) return filled;
    }
  } catch (err) {
    if (err instanceof TradingError) {
      await prisma.paperOrder.update({
        where: { id: order.id },
        data: { status: "rejected", rejectReason: err.message },
      });
      throw err;
    }
    // quote failure: leave pending for worker
    const { reportError } = await import("@/lib/observability/report-error");
    reportError(err, {
      source: "placeOrder.fillPending",
      extra: { orderId: order.id, symbol, assetType: input.assetType },
    });
  }

  return order;
}

export async function cancelOrder(userId: string, orderId: string) {
  const order = await prisma.paperOrder.findFirst({
    where: { id: orderId, userId },
  });
  if (!order) {
    throw new TradingError("Order not found", "NOT_FOUND");
  }
  if (order.status !== "pending") {
    throw new TradingError("Only pending orders can be cancelled", "NOT_PENDING");
  }
  return prisma.paperOrder.update({
    where: { id: orderId },
    data: { status: "cancelled" },
  });
}

export type ModifyOrderInput = {
  userId: string;
  orderId: string;
  qty: number;
  limitPrice?: number | null;
  stopPrice?: number | null;
};

/** Amend pending paper order qty / trigger price (type & side unchanged). */
export async function modifyOrder(input: ModifyOrderInput) {
  const order = await prisma.paperOrder.findFirst({
    where: { id: input.orderId, userId: input.userId },
  });
  if (!order) {
    throw new TradingError("Order not found", "NOT_FOUND");
  }
  if (order.status !== "pending") {
    throw new TradingError("Only pending orders can be modified", "NOT_PENDING");
  }

  const qty = input.qty;
  if (!(qty > 0) || !Number.isFinite(qty)) {
    throw new TradingError("Invalid quantity", "INVALID_QTY");
  }

  let limitPrice = order.limitPrice != null ? Number(order.limitPrice) : null;
  let stopPrice = order.stopPrice != null ? Number(order.stopPrice) : null;

  if (order.type === "limit") {
    const next = input.limitPrice;
    if (!(next != null && next > 0)) {
      throw new TradingError("limitPrice required", "INVALID_LIMIT");
    }
    limitPrice = next;
  }
  if (order.type === "stop") {
    const next = input.stopPrice;
    if (!(next != null && next > 0)) {
      throw new TradingError("stopPrice required", "INVALID_STOP");
    }
    stopPrice = next;
  }

  await assertPaperRisk({
    userId: input.userId,
    accountType: order.accountType,
    symbol: order.symbol,
    assetType: order.assetType,
    side: order.side,
    qty,
    type: order.type,
    limitPrice,
    stopPrice,
  });

  const updated = await prisma.$transaction(async (tx) => {
    if (order.side === "buy") {
      const { buyingPower } = await buyingPowerInTx(
        tx,
        input.userId,
        order.accountType,
      );
      const reserve =
        order.type === "limit"
          ? Number(limitPrice)
          : order.type === "stop"
            ? Number(stopPrice)
            : 0;
      if (reserve > 0 && buyingPower + 1e-8 < qty * reserve) {
        throw new TradingError("Insufficient cash", "INSUFFICIENT_CASH");
      }
    } else {
      const pos = await tx.paperPosition.findUnique({
        where: {
          userId_accountType_symbol_assetType: {
            userId: input.userId,
            accountType: order.accountType,
            symbol: order.symbol,
            assetType: order.assetType,
          },
        },
      });
      const held = pos ? Number(pos.qty) : 0;
      const pendingSells = await tx.paperOrder.findMany({
        where: {
          userId: input.userId,
          accountType: order.accountType,
          symbol: order.symbol,
          assetType: order.assetType,
          side: "sell",
          status: "pending",
          NOT: { id: order.id },
        },
      });
      const reserved = pendingSells.reduce((s, o) => s + Number(o.qty), 0);
      if (held - reserved + 1e-8 < qty) {
        throw new TradingError("Insufficient position", "INSUFFICIENT_POSITION");
      }
    }

    return tx.paperOrder.update({
      where: { id: order.id },
      data: {
        qty,
        limitPrice: order.type === "limit" ? limitPrice : null,
        stopPrice: order.type === "stop" ? stopPrice : null,
      },
    });
  });

  try {
    const quote = await getQuote(order.symbol, order.assetType);
    const price = quote.price;
    if (
      price > 0 &&
      shouldTriggerPending({
        type: order.type,
        side: order.side,
        price,
        limitPrice,
        stopPrice,
      })
    ) {
      const filled = await fillPendingOrder(updated.id, price);
      if (filled) return filled;
    }
  } catch (err) {
    if (err instanceof TradingError) throw err;
  }

  return updated;
}
