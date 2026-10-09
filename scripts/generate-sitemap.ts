import { PrismaClient } from "@prisma/client";
import { writeDailySitemapFile } from "../src/lib/seo/write-daily-sitemap";

const prisma = new PrismaClient();

writeDailySitemapFile({ prisma, force: true })
  .then((r) => {
    console.info("[seo]", r);
  })
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
