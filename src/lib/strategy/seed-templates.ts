import { prisma } from "@/lib/db";
import { STRATEGY_TEMPLATES } from "@/lib/strategy/templates";

/** Idempotent upsert of system strategy templates. */
export async function ensureStrategyTemplates() {
  for (const t of STRATEGY_TEMPLATES) {
    await prisma.strategy.upsert({
      where: { slug: t.slug },
      create: {
        slug: t.slug,
        name: t.nameZh,
        description: t.descriptionZh,
        rules: t.rules,
        isTemplate: true,
        userId: null,
      },
      update: {
        name: t.nameZh,
        description: t.descriptionZh,
        rules: t.rules,
        isTemplate: true,
      },
    });
  }
}
