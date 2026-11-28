import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureAccounts } from "@/lib/trading/account";
import { TradingError } from "@/lib/trading/execute";
import { assertTradePasswordFromRequest } from "@/lib/trading/trade-password";
import {
  cancelOrder,
  modifyOrder,
  placeOrder,
  serializeOrder,
} from "@/lib/trading/orders";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureAccounts(session.user.id);

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const symbol = url.searchParams.get("symbol");
  const assetType = url.searchParams.get("assetType");
  const accountType = url.searchParams.get("accountType") === "margin" ? "margin" : "cash";

  const orders = await prisma.paperOrder.findMany({
    where: {
      userId: session.user.id,
      accountType,
      ...(status
        ? {
            status: status as
              | "pending"
              | "filled"
              | "cancelled"
              | "rejected",
          }
        : {}),
      ...(symbol ? { symbol: symbol.toUpperCase() } : {}),
      ...(assetType === "stock" ||
      assetType === "hk" ||
      assetType === "crypto" ||
      assetType === "cn"
        ? { assetType }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { strategy: { select: { id: true, name: true } } },
  });

  return NextResponse.json({
    orders: orders.map((o) => ({
      ...serializeOrder(o),
      strategyName: o.strategy?.name ?? null,
    })),
  });
}

const createSchema = z.object({
  accountType: z.enum(["cash", "margin"]).optional(),
  symbol: z.string().min(1).max(20),
  assetType: z.enum(["stock", "hk", "crypto", "cn"]),
  side: z.enum(["buy", "sell"]),
  type: z.enum(["market", "limit", "stop"]),
  qty: z.number().positive(),
  limitPrice: z.number().positive().optional().nullable(),
  stopPrice: z.number().positive().optional().nullable(),
  emotionTags: z.array(z.string().max(32)).max(8).optional(),
  invalidationNote: z.string().max(200).optional().nullable(),
  strategyId: z.string().cuid().optional().nullable(),
  riskSnapshot: z.record(z.string(), z.unknown()).optional().nullable(),
  /** 6-digit trade PIN; required when the user has enabled a trade password. */
  tradePin: z.string().regex(/^\d{6}$/).optional().nullable(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    // Trade password is verified server-side; never trust the client flag.
    const { tradePin, accountType, ...orderInput } = parsed.data;
    await assertTradePasswordFromRequest(req, session.user.id, tradePin);
    const order = await placeOrder({
      userId: session.user.id,
      accountType: accountType ?? "cash",
      ...orderInput,
    });
    return NextResponse.json(
      { order: serializeOrder(order) },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof TradingError) {
      const status =
        err.code === "INVALID_TRADE_PASSWORD" ? 401 : 400;
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status },
      );
    }
    console.error("placeOrder", err);
    return NextResponse.json({ error: "Order failed" }, { status: 500 });
  }
}

const modifySchema = z.object({
  id: z.string().min(1),
  qty: z.number().positive(),
  limitPrice: z.number().positive().optional().nullable(),
  stopPrice: z.number().positive().optional().nullable(),
  tradePin: z.string().regex(/^\d{6}$/).optional().nullable(),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = modifySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    await assertTradePasswordFromRequest(req, session.user.id, parsed.data.tradePin);
    const order = await modifyOrder({
      userId: session.user.id,
      orderId: parsed.data.id,
      qty: parsed.data.qty,
      limitPrice: parsed.data.limitPrice,
      stopPrice: parsed.data.stopPrice,
    });
    return NextResponse.json({ order: serializeOrder(order) });
  } catch (err) {
    if (err instanceof TradingError) {
      const status =
        err.code === "NOT_FOUND"
          ? 404
          : err.code === "INVALID_TRADE_PASSWORD"
            ? 401
            : 400;
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status },
      );
    }
    console.error("modifyOrder", err);
    return NextResponse.json({ error: "Modify failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const queryPin = url.searchParams.get("tradePin");

  try {
    await assertTradePasswordFromRequest(req, session.user.id, queryPin);
    const order = await cancelOrder(session.user.id, id);
    return NextResponse.json({ order: serializeOrder(order) });
  } catch (err) {
    if (err instanceof TradingError) {
      const status =
        err.code === "NOT_FOUND"
          ? 404
          : err.code === "INVALID_TRADE_PASSWORD"
            ? 401
            : 400;
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status },
      );
    }
    console.error("cancelOrder", err);
    return NextResponse.json({ error: "Cancel failed" }, { status: 500 });
  }
}
