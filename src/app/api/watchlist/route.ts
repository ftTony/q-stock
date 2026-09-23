import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getQuotes } from "@/lib/market";
import { normalizeSymbol } from "@/lib/types";

const upsertSchema = z.object({
  symbol: z.string().min(1).max(20),
  assetType: z.enum(["stock", "hk", "crypto"]),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const withQuotes = new URL(req.url).searchParams.get("quotes") === "1";
  const items = await prisma.watchlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!withQuotes) {
    return NextResponse.json({
      items,
      counts: {
        stock: items.filter((i) => i.assetType === "stock").length,
        hk: items.filter((i) => i.assetType === "hk").length,
        crypto: items.filter((i) => i.assetType === "crypto").length,
        total: items.length,
      },
    });
  }

  const quotes = await getQuotes(
    items.map((i) => ({ symbol: i.symbol, assetType: i.assetType })),
  );
  const quoteMap = new Map(quotes.map((q) => [`${q.assetType}:${q.symbol}`, q]));

  return NextResponse.json({
    items: items.map((i) => ({
      ...i,
      quote: quoteMap.get(`${i.assetType}:${i.symbol}`) ?? null,
    })),
    counts: {
      stock: items.filter((i) => i.assetType === "stock").length,
      hk: items.filter((i) => i.assetType === "hk").length,
      crypto: items.filter((i) => i.assetType === "crypto").length,
      total: items.length,
    },
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = upsertSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const symbol = normalizeSymbol(parsed.data.symbol, parsed.data.assetType);
  const item = await prisma.watchlistItem.upsert({
    where: {
      userId_symbol_assetType: {
        userId: session.user.id,
        symbol,
        assetType: parsed.data.assetType,
      },
    },
    create: {
      userId: session.user.id,
      symbol,
      assetType: parsed.data.assetType,
    },
    update: {},
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const symbol = searchParams.get("symbol");
  const assetType = searchParams.get("assetType");

  if (id) {
    const existing = await prisma.watchlistItem.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await prisma.watchlistItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  if (symbol && (assetType === "stock" || assetType === "hk" || assetType === "crypto")) {
    const normalized = normalizeSymbol(symbol, assetType);
    await prisma.watchlistItem.deleteMany({
      where: {
        userId: session.user.id,
        symbol: normalized,
        assetType,
      },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "id or symbol+assetType required" }, { status: 400 });
}
