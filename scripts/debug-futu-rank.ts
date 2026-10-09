import { getFutuRankList } from "../src/lib/market/providers/futu-rank";
import { isFutuConfigured } from "../src/lib/market/providers/futu-http";

async function main() {
  console.log("futuConfigured", isFutuConfigured());
  for (const m of ["stock", "hk"] as const) {
    try {
      const q = await getFutuRankList(m, "hot", 50);
      console.log(m, "ok", q.length, q.slice(0, 8).map((x) => x.symbol));
    } catch (e) {
      console.log(m, "ERR", e instanceof Error ? e.message : e);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
