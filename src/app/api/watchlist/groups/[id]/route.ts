import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

async function ownedGroup(userId: string, id: string) {
  return prisma.watchlistGroup.findFirst({
    where: { id, userId },
  });
}

export async function GET(_req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const group = await prisma.watchlistGroup.findFirst({
    where: { id, userId: session.user.id },
    include: {
      members: {
        include: { item: true },
        orderBy: { item: { createdAt: "desc" } },
        take: 200,
      },
    },
  });
  if (!group) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    group: {
      id: group.id,
      name: group.name,
      sortOrder: group.sortOrder,
    },
    items: group.members.map((m) => m.item),
  });
}

const patchSchema = z.object({
  name: z.string().trim().min(1).max(40),
});

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const group = await ownedGroup(session.user.id, id);
  if (!group) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const updated = await prisma.watchlistGroup.update({
    where: { id },
    data: { name: parsed.data.name },
  });
  return NextResponse.json({
    group: {
      id: updated.id,
      name: updated.name,
      sortOrder: updated.sortOrder,
    },
  });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const group = await ownedGroup(session.user.id, id);
  if (!group) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.watchlistGroup.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
