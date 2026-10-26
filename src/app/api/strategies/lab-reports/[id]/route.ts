import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createShareToken } from "@/lib/strategy/share-token";
import { serializeLabReport } from "@/lib/strategy/serialize";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const report = await prisma.strategyLabReport.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ report: serializeLabReport(report) });
}

/** Enable or revoke public share on a done lab report. */
export async function POST(req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { revoke?: boolean };
  const report = await prisma.strategyLabReport.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (report.status !== "done") {
    return NextResponse.json(
      { error: "Only completed reports can be shared" },
      { status: 400 },
    );
  }

  if (body.revoke) {
    const updated = await prisma.strategyLabReport.update({
      where: { id },
      data: { shareToken: null },
    });
    return NextResponse.json({ report: serializeLabReport(updated) });
  }

  const token = report.shareToken ?? createShareToken();
  const updated = await prisma.strategyLabReport.update({
    where: { id },
    data: { shareToken: token },
  });
  return NextResponse.json({ report: serializeLabReport(updated) });
}
