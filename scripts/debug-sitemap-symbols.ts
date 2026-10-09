import { PrismaClient } from "@prisma/client";
import { isFutuConfigured } from "../src/lib/market/providers/futu-http";
import { isLongbridgeRankConfigured } from "../src/lib/market/providers/longbridge-rank";
import {
  fetchSymbolsFromMarketApi,
  resolveSymbolsForMarket,
  type SitemapMarket,
} from "../src/lib/seo/sitemap-symbols";

async function main() {
  console.log("futu", isFutuConfigured());
  console.log("longbridge", isLongbridgeRankConfigured());
  const prisma = new PrismaClient();
  try {
    for (const m of ["stock", "hk", "cn", "crypto"] as SitemapMarket[]) {
      const api = await fetchSymbolsFromMarketApi(m);
      const all = await resolveSymbolsForMarket(m, prisma);
      console.log(
        m,
        `api=${api.length}`,
        `all=${all.length}`,
        "sample=",
        all.slice(0, 12).join(","),
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
