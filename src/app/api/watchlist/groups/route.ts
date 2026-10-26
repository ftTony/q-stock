import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MAX_GROUPS = 30;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const groups = await prisma.watchlistGroup.findMany({
    where: { userId: session.user.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take: MAX_GROUPS,
    include: { _count: { select: { members: true } } },
  });

  return NextResponse.json({
    groups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      sortOrder: g.sortOrder,
      count: g._count.members,
      createdAt: g.createdAt,
    })),
  });
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(40).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = createSchema.safeParse(await req.json().catch(() => ({})));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const count = await prisma.watchlistGroup.count({
    where: { userId: session.user.id },
  });
  if (count >= MAX_GROUPS) {
    return NextResponse.json({ error: "Group limit reached" }, { status: 400 });
  }

  const name = body.data.name?.trim() || "新分组";
  const group = await prisma.watchlistGroup.create({
    data: {
      userId: session.user.id,
      name,
      sortOrder: count,
    },
  });

  return NextResponse.json(
    {
      group: {
        id: group.id,
        name: group.name,
        sortOrder: group.sortOrder,
        count: 0,
        createdAt: group.createdAt,
      },
    },
    { status: 201 },
  );
}
