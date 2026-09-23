import type { AssetType, OrderSide, OrderType, PaperOrder } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getQuote } from "@/lib/market";
import { normalizeSymbol } from "@/lib/types";
import { ensureAccount } from "@/lib/trading/account";
import { TradingError, applyFillInTx, fillPendingOrder, shouldTriggerPending } from "@/lib/trading/execute";

export type PlaceOrderInput = {
  userId: string;
  symbol: string;
  assetType: AssetType;
  side: OrderSide;
  type: OrderType;
  qty: number;
  limitPrice?: number | null;
  stopPrice?: number | null;
};

export function serializeOrder(order: PaperOrder) {
  return {
    id: order.id,
    userId: order.userId,
    symbol: order.symbol,
    assetType: order.assetType,
    side: order.side,
    type: order.type,
    qty: Number(order.qty),
    limitPrice: order.limitPrice != null ? Number(order.limitPrice) : null,
    stopPrice: order.stopPrice != null ? Number(order.stopPrice) : null,
    status: order.status,
    filledPrice: order.filledPrice != null ? Number(order.filledPrice) : null,
    filledAt: order.filledAt,
    rejectReason: order.rejectReason,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export async function placeOrder(input: PlaceOrderInput) {
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

  await ensureAccount(input.userId);

  if (input.type === "market") {
    const quote = await getQuote(symbol, input.assetType);
    const fillPrice = quote.price;
    if (!(fillPrice > 0)) {
      throw new TradingError("Invalid market price", "NO_QUOTE");
    }

    return prisma.$transaction(async (tx) => {
      if (input.side === "buy") {
        const account = await tx.paperAccount.findUniqueOrThrow({
          where: { userId: input.userId },
        });
        const cash = Number(account.cashBalance);
        if (cash + 1e-8 < qty * fillPrice) {
          throw new TradingError("Insufficient cash", "INSUFFICIENT_CASH");
        }
      } else {
        const pos = await tx.paperPosition.findUnique({
          where: {
            userId_symbol_assetType: {
              userId: input.userId,
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
          symbol,
          assetType: input.assetType,
          side: input.side,
          type: "market",
          qty,
          status: "pending",
        },
      });

      return applyFillInTx(tx, {
        orderId: order.id,
        userId: input.userId,
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
      const account = await tx.paperAccount.findUniqueOrThrow({
        where: { userId: input.userId },
      });
      const cash = Number(account.cashBalance);
      const reservePrice =
        input.type === "limit"
          ? Number(input.limitPrice)
          : Number(input.stopPrice);
      if (cash + 1e-8 < qty * reservePrice) {
        throw new TradingError("Insufficient cash", "INSUFFICIENT_CASH");
      }
    } else {
      const pos = await tx.paperPosition.findUnique({
        where: {
          userId_symbol_assetType: {
            userId: input.userId,
            symbol,
            assetType: input.assetType,
          },
        },
      });
      const held = pos ? Number(pos.qty) : 0;
      const pendingSells = await tx.paperOrder.findMany({
        where: {
          userId: input.userId,
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
        symbol,
        assetType: input.assetType,
        side: input.side,
        type: input.type,
        qty,
        limitPrice: input.type === "limit" ? input.limitPrice! : null,
        stopPrice: input.type === "stop" ? input.stopPrice! : null,
        status: "pending",
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
