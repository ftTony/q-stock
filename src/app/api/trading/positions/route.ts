import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getQuote } from "@/lib/market";
import { ensureAccount } from "@/lib/trading/account";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureAccount(session.user.id);

  const withQuotes =
    new URL(req.url).searchParams.get("quotes") === "1";

  const positions = await prisma.paperPosition.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  const items = await Promise.all(
    positions.map(async (p) => {
      const qty = Number(p.qty);
      const avgCost = Number(p.avgCost);
      let price: number | null = null;
      let marketValue: number | null = null;
      let unrealizedPnl: number | null = null;
      let unrealizedPnlPct: number | null = null;

      if (withQuotes) {
        try {
          const q = await getQuote(p.symbol, p.assetType);
          price = q.price;
          marketValue = qty * price;
          const cost = qty * avgCost;
          unrealizedPnl = marketValue - cost;
          unrealizedPnlPct = cost > 0 ? (unrealizedPnl / cost) * 100 : null;
        } catch {
          // leave quote fields null
        }
      }

      return {
        id: p.id,
        symbol: p.symbol,
        assetType: p.assetType,
        qty,
        avgCost,
        price,
        marketValue,
        unrealizedPnl,
        unrealizedPnlPct,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    }),
  );

  return NextResponse.json({ positions: items });
}
