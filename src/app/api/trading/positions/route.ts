import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getQuotes } from "@/lib/market";
import { withUserMarket } from "@/lib/market/with-user-market";
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
    take: 80,
  });

  return withUserMarket(session.user.id, async () => {
    const quoteMap = new Map<string, number>();
    if (withQuotes && positions.length) {
      const quotes = await getQuotes(
        positions.map((p) => ({ symbol: p.symbol, assetType: p.assetType })),
      ).catch(() => []);
      for (const q of quotes) {
        if (q.price > 0) quoteMap.set(`${q.assetType}:${q.symbol}`, q.price);
      }
    }

    const items = positions.map((p) => {
      const qty = Number(p.qty);
      const avgCost = Number(p.avgCost);
      const price = quoteMap.get(`${p.assetType}:${p.symbol}`) ?? null;
      const marketValue = price != null ? qty * price : null;
      const cost = qty * avgCost;
      const unrealizedPnl =
        marketValue != null ? marketValue - cost : null;
      const unrealizedPnlPct =
        unrealizedPnl != null && cost > 0
          ? (unrealizedPnl / cost) * 100
          : null;

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
    });

    return NextResponse.json({ positions: items });
  });
}
