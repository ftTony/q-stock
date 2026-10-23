import { NextResponse } from "next/server";
import { getLocale } from "next-intl/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { strategyRulesSchema } from "@/lib/strategy/rules";
import { serializeStrategy } from "@/lib/strategy/serialize";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const session = await auth();
  const locale = await getLocale();

  const strategy = await prisma.strategy.findUnique({ where: { id } });
  if (!strategy) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (
    !strategy.isTemplate &&
    strategy.userId !== session?.user?.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    strategy: serializeStrategy(strategy, locale),
  });
}

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(500).optional().nullable(),
  rules: strategyRulesSchema.optional(),
});

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await prisma.strategy.findFirst({
    where: { id, userId: session.user.id, isTemplate: false },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const strategy = await prisma.strategy.update({
    where: { id },
    data: {
      ...(parsed.data.name != null ? { name: parsed.data.name } : {}),
      ...(parsed.data.description !== undefined
        ? { description: parsed.data.description }
        : {}),
      ...(parsed.data.rules != null ? { rules: parsed.data.rules } : {}),
    },
  });

  return NextResponse.json({ strategy: serializeStrategy(strategy) });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await prisma.strategy.findFirst({
    where: { id, userId: session.user.id, isTemplate: false },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.strategy.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
