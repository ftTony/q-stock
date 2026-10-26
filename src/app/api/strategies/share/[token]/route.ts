import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  serializeLabReport,
  serializeReplay,
} from "@/lib/strategy/serialize";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  if (!token || token.length < 16 || token.length > 64) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const replay = await prisma.strategyReplay.findFirst({
    where: { shareToken: token, status: "done" },
    include: { strategy: { select: { name: true, isTemplate: true } } },
  });
  if (replay) {
    return NextResponse.json({
      kind: "replay" as const,
      strategyName: replay.strategy.name,
      replay: serializeReplay(replay, { public: true }),
    });
  }

  const report = await prisma.strategyLabReport.findFirst({
    where: { shareToken: token, status: "done" },
  });
  if (report) {
    return NextResponse.json({
      kind: "lab" as const,
      report: serializeLabReport(report, { public: true }),
    });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
