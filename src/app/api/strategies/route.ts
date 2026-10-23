import { NextResponse } from "next/server";
import { getLocale } from "next-intl/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseStrategyRules, strategyRulesSchema } from "@/lib/strategy/rules";
import { ensureStrategyTemplates } from "@/lib/strategy/seed-templates";
import { serializeStrategy } from "@/lib/strategy/serialize";

export async function GET(req: Request) {
  await ensureStrategyTemplates();

  const url = new URL(req.url);
  const mine = url.searchParams.get("mine") === "1";
  const session = await auth();
  const locale = await getLocale();

  if (mine) {
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const strategies = await prisma.strategy.findMany({
      where: { userId: session.user.id, isTemplate: false },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
    return NextResponse.json({
      strategies: strategies.map((s) => serializeStrategy(s, locale)),
    });
  }

  const templates = await prisma.strategy.findMany({
    where: { isTemplate: true },
    orderBy: { slug: "asc" },
    take: 20,
  });

  let mineList: typeof templates = [];
  if (session?.user?.id) {
    mineList = await prisma.strategy.findMany({
      where: { userId: session.user.id, isTemplate: false },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
  }

  return NextResponse.json({
    templates: templates.map((s) => serializeStrategy(s, locale)),
    strategies: mineList.map((s) => serializeStrategy(s, locale)),
  });
}

const createSchema = z
  .object({
    name: z.string().min(1).max(80).optional(),
    description: z.string().max(500).optional().nullable(),
    rules: strategyRulesSchema.optional(),
    fromTemplateId: z.string().cuid().optional(),
  })
  .refine((v) => Boolean(v.fromTemplateId || v.rules), {
    message: "rules or fromTemplateId required",
  });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  let rules = parsed.data.rules;
  let description = parsed.data.description ?? null;
  let name = parsed.data.name ?? "My strategy";

  if (parsed.data.fromTemplateId) {
    const tpl = await prisma.strategy.findFirst({
      where: { id: parsed.data.fromTemplateId, isTemplate: true },
    });
    if (!tpl) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    rules = parseStrategyRules(tpl.rules);
    if (!description) description = tpl.description;
    if (!parsed.data.name) name = `${tpl.name} (copy)`;
  }

  if (!rules) {
    return NextResponse.json({ error: "Invalid rules" }, { status: 400 });
  }

  const count = await prisma.strategy.count({
    where: { userId: session.user.id, isTemplate: false },
  });
  if (count >= 40) {
    return NextResponse.json({ error: "Strategy limit reached" }, { status: 400 });
  }

  const strategy = await prisma.strategy.create({
    data: {
      userId: session.user.id,
      name,
      description,
      rules,
      isTemplate: false,
      slug: null,
    },
  });

  return NextResponse.json(
    { strategy: serializeStrategy(strategy) },
    { status: 201 },
  );
}
