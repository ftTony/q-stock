/**
 * Grant Pro to a user by email.
 * Usage: npx tsx scripts/grant-pro.ts user@example.com 30
 */
import { prisma } from "../src/lib/db";
import { grantProPlan } from "../src/lib/billing/grant-pro";

async function main() {
  const email = process.argv[2]?.trim();
  const days = Number(process.argv[3] || "30");
  if (!email || !Number.isFinite(days) || days < 1) {
    console.error("Usage: npx tsx scripts/grant-pro.ts <email> [days]");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("User not found:", email);
    process.exit(1);
  }

  const result = await grantProPlan(user.id, {
    days,
    source: "admin_script",
    note: `grant-pro.ts ${email}`,
  });
  console.log("Granted Pro:", {
    email,
    days,
    planExpiresAt: result.planExpiresAt?.toISOString() ?? null,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
