import { EquityMarketVendor, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("client-enum", EquityMarketVendor);
  const rows = await prisma.$queryRaw<
    { enumlabel: string }[]
  >`SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'EquityMarketVendor' ORDER BY e.enumsortorder`;
  console.log("db-enum", rows.map((r) => r.enumlabel));
  const u = await prisma.user.findFirst({
    select: { id: true, equityVendor: true },
  });
  console.log("sample-user", u);
  if (!u) return;
  await prisma.user.update({
    where: { id: u.id },
    data: { equityVendor: "tiger" },
  });
  console.log(
    "updated",
    await prisma.user.findUnique({
      where: { id: u.id },
      select: { equityVendor: true },
    }),
  );
  await prisma.user.update({
    where: { id: u.id },
    data: { equityVendor: u.equityVendor },
  });
}

main()
  .catch((e) => {
    console.error("fail", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
