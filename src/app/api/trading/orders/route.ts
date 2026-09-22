import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureAccount } from "@/lib/trading/account";
import { TradingError } from "@/lib/trading/execute";
import {
  cancelOrder,
  placeOrder,
  serializeOrder,
} from "@/lib/trading/orders";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureAccount(session.user.id);

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const symbol = url.searchParams.get("symbol");
  const assetType = url.searchParams.get("assetType");

  const orders = await prisma.paperOrder.findMany({
    where: {
      userId: session.user.id,
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
      ...(assetType === "stock" || assetType === "crypto"
        ? { assetType }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    orders: orders.map(serializeOrder),
  });
}

const createSchema = z.object({
  symbol: z.string().min(1).max(20),
  assetType: z.enum(["stock", "crypto"]),
  side: z.enum(["buy", "sell"]),
  type: z.enum(["market", "limit", "stop"]),
  qty: z.number().positive(),
  limitPrice: z.number().positive().optional().nullable(),
  stopPrice: z.number().positive().optional().nullable(),
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
    const order = await placeOrder({
      userId: session.user.id,
      ...parsed.data,
    });
    return NextResponse.json(
      { order: serializeOrder(order) },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof TradingError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 400 },
      );
    }
    console.error("placeOrder", err);
    return NextResponse.json({ error: "Order failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  try {
    const order = await cancelOrder(session.user.id, id);
    return NextResponse.json({ order: serializeOrder(order) });
  } catch (err) {
    if (err instanceof TradingError) {
      const status = err.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status },
      );
    }
    console.error("cancelOrder", err);
    return NextResponse.json({ error: "Cancel failed" }, { status: 500 });
  }
}
