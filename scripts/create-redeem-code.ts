/**
 * Create a Pro redeem code.
 * Usage: npx tsx scripts/create-redeem-code.ts [CODE] [days] [maxRedemptions]
 */
import { randomBytes } from "node:crypto";
import { prisma } from "../src/lib/db";

async function main() {
  const code = (
    process.argv[2]?.trim() ||
    `PRO-${randomBytes(4).toString("hex").toUpperCase()}`
  ).toUpperCase();
  const days = Number(process.argv[3] || "30");
  const maxRedemptions = Number(process.argv[4] || "1");

  const row = await prisma.redeemCode.create({
    data: {
      code,
      days,
      maxRedemptions,
      note: "create-redeem-code.ts",
    },
  });

  console.log("Created redeem code:", {
    code: row.code,
    days: row.days,
    maxRedemptions: row.maxRedemptions,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
