import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  symbol: z.string().min(1).max(20),
  assetType: z.enum(["stock", "crypto"]),
  condition: z.enum(["gte", "lte"]),
  triggerPrice: z.number().positive(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await prisma.priceAlert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    alerts: alerts.map((a) => ({
      ...a,
      triggerPrice: Number(a.triggerPrice),
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const alert = await prisma.priceAlert.create({
    data: {
      userId: session.user.id,
      symbol: parsed.data.symbol.toUpperCase(),
      assetType: parsed.data.assetType,
      condition: parsed.data.condition,
      triggerPrice: parsed.data.triggerPrice,
    },
  });

  return NextResponse.json(
    { alert: { ...alert, triggerPrice: Number(alert.triggerPrice) } },
    { status: 201 },
  );
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = z
    .object({
      id: z.string(),
      status: z.enum(["active", "disabled"]),
    })
    .safeParse(await req.json());

  if (!body.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.priceAlert.findUnique({
    where: { id: body.data.id },
  });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const alert = await prisma.priceAlert.update({
    where: { id: body.data.id },
    data: {
      status: body.data.status,
      triggeredAt: body.data.status === "active" ? null : existing.triggeredAt,
    },
  });

  return NextResponse.json({
    alert: { ...alert, triggerPrice: Number(alert.triggerPrice) },
  });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const existing = await prisma.priceAlert.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.priceAlert.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
