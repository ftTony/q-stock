import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serializeReplay } from "@/lib/strategy/serialize";

/** Recent replay jobs across the signed-in user's strategies (lab history tab). */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const replays = await prisma.strategyReplay.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { strategy: { select: { id: true, name: true } } },
  });

  return NextResponse.json({
    replays: replays.map((r) => ({
      ...serializeReplay(r),
      strategyName: r.strategy.name,
    })),
  });
}
