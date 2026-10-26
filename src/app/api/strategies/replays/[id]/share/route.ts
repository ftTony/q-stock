import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createShareToken } from "@/lib/strategy/share-token";
import { serializeReplay } from "@/lib/strategy/serialize";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { revoke?: boolean };

  const replay = await prisma.strategyReplay.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!replay) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (replay.status !== "done") {
    return NextResponse.json(
      { error: "Only completed replays can be shared" },
      { status: 400 },
    );
  }

  if (body.revoke) {
    const updated = await prisma.strategyReplay.update({
      where: { id },
      data: { shareToken: null },
    });
    return NextResponse.json({ replay: serializeReplay(updated) });
  }

  const token = replay.shareToken ?? createShareToken();
  const updated = await prisma.strategyReplay.update({
    where: { id },
    data: { shareToken: token },
  });
  return NextResponse.json({ replay: serializeReplay(updated) });
}
