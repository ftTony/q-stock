import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizeSymbol } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

const addSchema = z.object({
  itemIds: z.array(z.string().cuid()).min(1).max(50).optional(),
  symbol: z.string().min(1).max(20).optional(),
  assetType: z.enum(["stock", "hk", "crypto", "cn"]).optional(),
});

/** Add existing watchlist rows and/or upsert a symbol into this group. */
export async function POST(req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: groupId } = await ctx.params;
  const group = await prisma.watchlistGroup.findFirst({
    where: { id: groupId, userId: session.user.id },
  });
  if (!group) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = addSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const itemIds = new Set<string>(parsed.data.itemIds ?? []);

  if (parsed.data.symbol && parsed.data.assetType) {
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
    itemIds.add(item.id);
  }

  if (!itemIds.size) {
    return NextResponse.json({ error: "Nothing to add" }, { status: 400 });
  }

  const owned = await prisma.watchlistItem.findMany({
    where: {
      userId: session.user.id,
      id: { in: [...itemIds] },
    },
    select: { id: true },
  });
  const ownedIds = owned.map((o) => o.id);
  if (!ownedIds.length) {
    return NextResponse.json({ error: "No matching items" }, { status: 400 });
  }

  await prisma.watchlistGroupMember.createMany({
    data: ownedIds.map((itemId) => ({ groupId, itemId })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true, added: ownedIds.length });
}

const removeSchema = z.object({
  itemIds: z.array(z.string().cuid()).min(1).max(50),
});

/** Remove items from this group only (does not delete watchlist rows). */
export async function DELETE(req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: groupId } = await ctx.params;
  const group = await prisma.watchlistGroup.findFirst({
    where: { id: groupId, userId: session.user.id },
  });
  if (!group) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const parsed = removeSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  await prisma.watchlistGroupMember.deleteMany({
    where: {
      groupId,
      itemId: { in: parsed.data.itemIds },
    },
  });
  return NextResponse.json({ ok: true });
}
